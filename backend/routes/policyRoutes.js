const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireWriterOrAdmin } = require('../middleware/auth');

// Initialize Octokit with GitHub App authentication
let octokit;
const initializeOctokit = async () => {
  if (!octokit) {
    const { Octokit } = await import('@octokit/rest');
    const { createAppAuth } = await import('@octokit/auth-app');

    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_INSTALLATION_ID || !process.env.GITHUB_PRIVATE_KEY) {
      throw new Error('GitHub App configuration missing. Please set GITHUB_APP_ID, GITHUB_INSTALLATION_ID, and GITHUB_PRIVATE_KEY environment variables.');
    }
    
    const privateKey = process.env.GITHUB_PRIVATE_KEY;
    octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID,
        privateKey,
        installationId: Number(process.env.GITHUB_INSTALLATION_ID),
      },
      request: {
        // Ensure latest API version header is sent
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    });
  }
  return octokit;
};

// Helper to get organization name
const getOrganization = () => {
  if (!process.env.GITHUB_ORGANIZATION) {
    throw new Error('GITHUB_ORGANIZATION environment variable is required');
  }
  return process.env.GITHUB_ORGANIZATION;
};

// Get list of policy repos
router.get('/', async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const org = getOrganization();
    let repos = [];
    try {
      const response = await octokit.repos.listForOrg({
        org,
        type: 'all',
      });
      repos = response.data;
    } catch (err) {
      // Fallback if value provided is a user, not an org
      const status = err?.status || err?.response?.status;
      if (status === 404 || status === 422) {
        const response = await octokit.repos.listForUser({
          username: org,
          type: 'owner',
        });
        repos = response.data;
      } else {
        throw err;
      }
    }
    // Filter repos that are policies, e.g., name starts with 'policy-'
    const policyRepos = repos.filter(repo => repo.name.startsWith('policy-'));
    res.json(policyRepos);
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const message = error?.response?.data?.message || error?.message || 'Unknown error';
    console.error('Error fetching policy repos:', { status, message });
    res.status(500).json({ error: `Failed to fetch policies: ${message}` });
  }
});

// Get list of branches for a repo
router.get('/:repo/branches', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo } = req.params;
    const { data } = await octokit.repos.listBranches({
      owner: getOrganization(),
      repo,
    });
    // Filter out the main branch to prevent direct editing on it
    const filteredBranches = data.filter(branch => branch.name !== 'main');
    res.json(filteredBranches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Get list of PRs for a repo
router.get('/:repo/pulls', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo } = req.params;
    const { data } = await octokit.pulls.list({
      owner: getOrganization(),
      repo,
      state: 'open',
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching PRs:', error);
    res.status(500).json({ error: 'Failed to fetch PRs' });
  }
});

// Get specific PR details
router.get('/:repo/pulls/:id', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo, id } = req.params;
    const { data } = await octokit.pulls.get({
      owner: getOrganization(),
      repo,
      pull_number: parseInt(id),
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching PR:', error);
    res.status(500).json({ error: 'Failed to fetch PR' });
  }
});

// Get PR reviews
router.get('/:repo/pulls/:id/reviews', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo, id } = req.params;
    const { data } = await octokit.pulls.listReviews({
      owner: getOrganization(),
      repo,
      pull_number: parseInt(id),
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching PR reviews:', error);
    res.status(500).json({ error: 'Failed to fetch PR reviews' });
  }
});

// Get PR comments
router.get('/:repo/pulls/:id/comments', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo, id } = req.params;
    const { data } = await octokit.issues.listComments({
      owner: getOrganization(),
      repo,
      issue_number: parseInt(id),
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching PR comments:', error);
    res.status(500).json({ error: 'Failed to fetch PR comments' });
  }
});

// Get PR files changed
router.get('/:repo/pulls/:id/files', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo, id } = req.params;
    const { data } = await octokit.pulls.listFiles({
      owner: getOrganization(),
      repo,
      pull_number: parseInt(id),
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching PR files:', error);
    res.status(500).json({ error: 'Failed to fetch PR files' });
  }
});

// Post a comment on PR
router.post('/:repo/pulls/:id/comments', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo, id } = req.params;
    const { body } = req.body;
    const userName = `${req.user.firstName} ${req.user.lastName}`;
    const bodyWithUser = `${userName}: ${body}`;
    const { data } = await octokit.issues.createComment({
      owner: getOrganization(),
      repo,
      issue_number: parseInt(id),
      body: bodyWithUser,
    });
    res.json(data);
  } catch (error) {
    console.error('Error posting PR comment:', error);
    res.status(500).json({ error: 'Failed to post PR comment' });
  }
});

// Get content of a specific policy file
router.get('/:repo/:path(*)', async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo, path } = req.params;
    const { ref } = req.query; // Add support for branch/ref query parameter
    const { data } = await octokit.repos.getContent({
      owner: getOrganization(),
      repo,
      path,
      ref, // Use the ref if provided
    });
    // If directory listing is returned, pass through
    if (Array.isArray(data)) {
      return res.json(data);
    }
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    res.json({ content, sha: data.sha });
  } catch (error) {
    console.error('Error fetching policy content:', error);
    res.status(500).json({ error: 'Failed to fetch policy content' });
  }
});

// Edit and propose changes (create branch, commit, PR)
router.post('/:repo/edit', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo } = req.params;
    const { path, content, message, branchName, draft } = req.body;
    const owner = getOrganization();
    const { firstName, lastName } = req.user;
    const userName = `${firstName} ${lastName}`;
    const title = `${userName}'s changes`;

    let targetBranch = branchName;
    let branchExists = false;

    // Check if branch exists
    if (branchName) {
      try {
        await octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${branchName}`,
        });
        branchExists = true;
        targetBranch = branchName;
      } catch (e) {
        // Branch doesn't exist, will create it
        branchExists = false;
      }
    }

    if (!targetBranch) {
      targetBranch = `${firstName}-${lastName}-changes-${Date.now()}`;
    }

    let baseBranch = 'main';
    let baseSha;

    if (branchExists) {
      // Use the existing branch as base
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${targetBranch}`,
      });
      baseSha = refData.object.sha;
      baseBranch = targetBranch; // For PR creation, base should be main, but we'll handle this differently
    } else {
      // Get the SHA of the main branch to create new branch
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: 'heads/main',
      });
      baseSha = refData.object.sha;

      // Create a new branch
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${targetBranch}`,
        sha: baseSha,
      });
    }

    // Get current file SHA from the target branch
    let fileSha;
    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: targetBranch,
      });
      fileSha = fileData.sha;
    } catch (e) {
      // File doesn't exist on this branch, sha not needed
    }

    // Commit the new content
    const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: message || `Policy update by ${userName}`,
      content: Buffer.from(content).toString('base64'),
      branch: targetBranch,
      sha: fileSha,
    });

    // Only create PR if it's a new branch (not existing)
    let prData = null;
    if (!branchExists) {
      prData = await octokit.pulls.create({
        owner,
        repo,
        title,
        head: targetBranch,
        base: 'main',
        body: message || `Policy update by ${userName}`,
        draft: draft || false,
      });
    }

    res.json({ commit: commitData, pr: prData, branch: targetBranch, branchExists });
  } catch (error) {
    console.error('Error editing policy:', error);
    res.status(500).json({ error: 'Failed to edit policy' });
  }
});

// Update PR status (draft to open, etc.)
router.patch('/:repo/pulls/:id', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo, id } = req.params;
    const { draft } = req.body;
    
    if (draft !== undefined) {
      // Get the PR to obtain the node_id for GraphQL
      const { data: pr } = await octokit.pulls.get({
        owner: getOrganization(),
        repo,
        pull_number: parseInt(id),
      });
      const pullRequestId = pr.node_id;
      
      if (draft) {
        // Convert to draft
        await octokit.graphql(`
          mutation($pullRequestId: ID!) {
            convertPullRequestToDraft(input: { pullRequestId: $pullRequestId }) {
              pullRequest {
                id
              }
            }
          }
        `, {
          pullRequestId,
        });
      } else {
        // Mark as ready for review
        await octokit.graphql(`
          mutation($pullRequestId: ID!) {
            markPullRequestReadyForReview(input: { pullRequestId: $pullRequestId }) {
              pullRequest {
                id
              }
            }
          }
        `, {
          pullRequestId,
        });
      }
    } else {
      return res.status(400).json({ error: 'No valid updates provided' });
    }
    
    // Fetch the updated PR data
    const { data: updatedPr } = await octokit.pulls.get({
      owner: getOrganization(),
      repo,
      pull_number: parseInt(id),
    });
    
    res.json(updatedPr);
  } catch (error) {
    console.error('Error updating PR:', error);
    res.status(500).json({ error: 'Failed to update PR' });
  }
});

// Create a new policy repo (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { name, description } = req.body;
    const owner = getOrganization();
    const repoName = `policy-${name}`;

    // Create the repository
    const { data: repoData } = await octokit.repos.createInOrg({
      org: owner,
      name: repoName,
      description,
      private: true, // or false if needed
    });

    // Create policy.md file
    const policyContent = `# ${name}\n\nThis is the initial policy document.\n\nPlease edit this file to add your policy content.`;

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: 'policy.md',
      message: 'Initial commit: Add policy.md',
      content: Buffer.from(policyContent).toString('base64'),
      branch: 'main',
    });

    // Create README.md file
    const readmeContent = `# ${name}\n\n${description || 'Policy repository for ' + name}\n\nTags: \nRelated Policies: \n\n## Files\n\n- policy.md - The main policy document`;

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: 'README.md',
      message: 'Initial commit: Add README.md',
      content: Buffer.from(readmeContent).toString('base64'),
      branch: 'main',
    });

    res.json(repoData);
  } catch (error) {
    console.error('Error creating policy repo:', error);
    res.status(500).json({ error: 'Failed to create policy repo' });
  }
});

// Set tags for a repo (admin only)
router.post('/:repo/tags', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo } = req.params;
    const { tags } = req.body; // tags should be an array of strings
    const owner = getOrganization();
    const userName = `${req.user.firstName} ${req.user.lastName}`;

    // Fetch current README.md content
    let currentContent = '';
    let sha = null;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'README.md',
      });
      currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
      sha = data.sha;
    } catch (e) {
      // README.md doesn't exist, create it
      currentContent = '';
    }

    // Update or add tags line
    const lines = currentContent.split('\n');
    const tagsLineIndex = lines.findIndex(line => line.toLowerCase().startsWith('tags:'));
    const newTagsLine = `Tags: ${tags.join(', ')}`;

    if (tagsLineIndex !== -1) {
      lines[tagsLineIndex] = newTagsLine;
    } else {
      // Add tags line at the beginning
      lines.unshift(newTagsLine);
    }

    const updatedContent = lines.join('\n');

    // Commit the updated README.md
    const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: `Update tags by ${userName}`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha,
    });

    res.json({ success: true, commit: commitData });
  } catch (error) {
    console.error('Error setting tags:', error);
    res.status(500).json({ error: 'Failed to set tags' });
  }
});

// Delete a policy repo (admin only)
router.delete('/:repo', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo } = req.params;
    const owner = getOrganization();

    // Verify the repo is a policy repo (starts with 'policy-')
    if (!repo.startsWith('policy-')) {
      return res.status(400).json({ error: 'Can only delete policy repositories' });
    }

    // Delete the repository
    await octokit.repos.delete({
      owner,
      repo,
    });

    res.json({ success: true, message: `Repository ${repo} deleted successfully` });
  } catch (error) {
    console.error('Error deleting policy repo:', error);
    const status = error?.status || error?.response?.status;
    const message = error?.response?.data?.message || error?.message || 'Unknown error';
    res.status(status || 500).json({ error: `Failed to delete policy repo: ${message}` });
  }
});

module.exports = router;