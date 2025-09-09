const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken, requireAdmin, requireWriterOrAdmin } = require('../middleware/auth');

// Initialize Octokit with GitHub App authentication
let octokit;
const initializeOctokit = async () => {
  if (!octokit) {
    const { Octokit } = await import('@octokit/rest');
    const { createAppAuth } = await import('@octokit/auth-app');

    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_INSTALLATION_ID) {
      throw new Error('GitHub App configuration missing. Please set GITHUB_APP_ID and GITHUB_INSTALLATION_ID environment variables, and ensure policy-access.private-key.pem exists.');
    }
    // Read private key from file
    const privateKeyPath = path.join(__dirname, '../policy-access.private-key.pem');
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
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
    res.json(data);
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
    const { data } = await octokit.repos.getContent({
      owner: getOrganization(),
      repo,
      path,
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
    const { path, content, message, branchName } = req.body;
    const owner = getOrganization();
    const { firstName, lastName } = req.user;
    const userName = `${firstName} ${lastName}`;
    const title = `${userName}'s changes`;

    // Get the SHA of the main branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main',
    });
    const sha = refData.object.sha;

    // Create a new branch
    const newBranch = branchName || `${firstName}-${lastName}-changes-${Date.now()}`;
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha,
    });

    // Get current file SHA
    let fileSha;
    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: 'main',
      });
      fileSha = fileData.sha;
    } catch (e) {
      // File doesn't exist, sha not needed
    }

    // Commit the new content
    const { data: commitData } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: message || `Policy update by ${userName}`,
      content: Buffer.from(content).toString('base64'),
      branch: newBranch,
      sha: fileSha,
    });

    // Create a PR
    const { data: prData } = await octokit.pulls.create({
      owner,
      repo,
      title,
      head: newBranch,
      base: 'main',
      body: message || `Policy update by ${userName}`,
    });

    res.json({ commit: commitData, pr: prData });
  } catch (error) {
    console.error('Error editing policy:', error);
    res.status(500).json({ error: 'Failed to edit policy' });
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
      private: false, // or true if needed
    });

    // Create an empty policy.md file
    const initialContent = `# ${name}\n\nThis is the initial policy document.\n\nPlease edit this file to add your policy content.`;

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: 'policy.md',
      message: 'Initial commit: Add policy.md',
      content: Buffer.from(initialContent).toString('base64'),
      branch: 'main',
    });

    res.json(repoData);
  } catch (error) {
    console.error('Error creating policy repo:', error);
    res.status(500).json({ error: 'Failed to create policy repo' });
  }
});

module.exports = router;