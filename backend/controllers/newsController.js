const prisma = require('../utils/prisma');

// Get all published posts with optional filtering and pagination
const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      featured 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      status: 'PUBLISHED',
      ...(category && category !== 'all' && { category: category.toUpperCase() }),
      ...(featured !== undefined && { featured: featured === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          excerpt: true,
          category: true,
          status: true,
          featured: true,
          readTime: true,
          imageUrl: true,
          tags: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          _count: {
            select: {
              reactions: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.post.count({ where })
    ]);

    // Get reaction counts for each post
    const postsWithReactionCounts = await Promise.all(
      posts.map(async (post) => {
        const reactionCounts = await prisma.reaction.groupBy({
          by: ['emoji'],
          where: { postId: post.id },
          _count: { emoji: true }
        });

        const reactionSummary = reactionCounts.reduce((acc, reaction) => {
          acc[reaction.emoji] = reaction._count.emoji;
          return acc;
        }, {});

        return {
          ...post,
          reactionCounts: reactionSummary
        };
      })
    );

    res.json({
      success: true,
      data: {
        posts: postsWithReactionCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        _count: {
          select: {
            reactions: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only allow access to published posts for non-authors
    if (post.status !== 'PUBLISHED' && req.user.userId !== post.authorId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get reaction counts for this post
    const reactionCounts = await prisma.reaction.groupBy({
      by: ['emoji'],
      where: { postId: post.id },
      _count: { emoji: true }
    });

    const reactionSummary = reactionCounts.reduce((acc, reaction) => {
      acc[reaction.emoji] = reaction._count.emoji;
      return acc;
    }, {});

    const postWithReactionCounts = {
      ...post,
      reactionCounts: reactionSummary
    };

    res.json({
      success: true,
      data: postWithReactionCounts
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

// Create a new post (Admin and Writer only)
const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category = 'NEWS',
      status = 'DRAFT',
      featured = false,
      readTime,
      imageUrl,
      tags = []
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Auto-generate excerpt if not provided
    const autoExcerpt = excerpt || content.substring(0, 200) + '...';

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: autoExcerpt,
        category: category.toUpperCase(),
        status: status.toUpperCase(),
        featured,
        readTime,
        imageUrl,
        tags,
        authorId: req.user.userId, // Use userId from JWT payload
        ...(status.toUpperCase() === 'PUBLISHED' && { publishedAt: new Date() })
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Update a post (Author, Admin only)
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      category,
      status,
      featured,
      readTime,
      imageUrl,
      tags
    } = req.body;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions (author or admin)
    if (existingPost.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category.toUpperCase();
    if (status !== undefined) {
      updateData.status = status.toUpperCase();
      // Set publishedAt when publishing
      if (status.toUpperCase() === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    if (featured !== undefined) updateData.featured = featured;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (tags !== undefined) updateData.tags = tags;

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: post,
      message: 'Post updated successfully'
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

// Delete a post (Author, Admin only)
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions (author or admin)
    if (existingPost.authorId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await prisma.post.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// Get user's own posts (drafts and published)
const getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      authorId: req.user.userId,
      ...(status && { status: status.toUpperCase() })
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          _count: {
            select: {
              reactions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.post.count({ where })
    ]);

    // Get reaction counts for each post
    const postsWithReactionCounts = await Promise.all(
      posts.map(async (post) => {
        const reactionCounts = await prisma.reaction.groupBy({
          by: ['emoji'],
          where: { postId: post.id },
          _count: { emoji: true }
        });

        const reactionSummary = reactionCounts.reduce((acc, reaction) => {
          acc[reaction.emoji] = reaction._count.emoji;
          return acc;
        }, {});

        return {
          ...post,
          reactionCounts: reactionSummary
        };
      })
    );

    res.json({
      success: true,
      data: {
        posts: postsWithReactionCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Add or update reaction to a post
const toggleReaction = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    // Check if post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already reacted to this post
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId: req.user.userId,
          postId
        }
      }
    });

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Remove reaction if same emoji
        await prisma.reaction.delete({
          where: { id: existingReaction.id }
        });
        
        res.json({
          success: true,
          message: 'Reaction removed',
          action: 'removed'
        });
      } else {
        // Update reaction with new emoji
        const updatedReaction = await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { emoji },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });

        res.json({
          success: true,
          data: updatedReaction,
          message: 'Reaction updated',
          action: 'updated'
        });
      }
    } else {
      // Create new reaction
      const reaction = await prisma.reaction.create({
        data: {
          emoji,
          userId: req.user.userId,
          postId
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: reaction,
        message: 'Reaction added',
        action: 'added'
      });
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle reaction',
      error: error.message
    });
  }
};

// Get reactions for a post
const getPostReactions = async (req, res) => {
  try {
    const { id: postId } = req.params;

    const reactions = await prisma.reaction.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group reactions by emoji
    const reactionSummary = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: []
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        reactions,
        summary: Object.values(reactionSummary)
      }
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reactions',
      error: error.message
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  toggleReaction,
  getPostReactions
};
