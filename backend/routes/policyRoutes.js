const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireWriterOrAdmin } = require('../middleware/auth');

// Initialize Octokit with GitHub App authentication
let octokit;
const initializeOctokit = async () => {
  if (!octokit) {
    const { Octokit } = await import('@octokit/rest');
    const { createAppAuth } = await import('@octokit/auth-app');

    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_PRIVATE_KEY || !process.env.GITHUB_INSTALLATION_ID) {
      throw new Error('GitHub App configuration missing. Please set GITHUB_APP_ID, GITHUB_PRIVATE_KEY, and GITHUB_INSTALLATION_ID environment variables.');
    }
    
    octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_PRIVATE_KEY,
        installationId: process.env.GITHUB_INSTALLATION_ID,
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
    
    const response = await octokit.repos.listForOrg({
      org,
      type: 'all',
    });
    
    // Filter repos that are policies, e.g., name starts with 'policy-'
    const policyRepos = response.data.filter(repo => repo.name.startsWith('policy-'));
    res.json(policyRepos);
  } catch (error) {
    console.error('Error fetching policy repos:', error);
    res.status(500).json({ error: 'Failed to fetch policies: ' + error.message });
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
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    res.json({ content, sha: data.sha });
  } catch (error) {
    console.error('Error fetching policy content:', error);
    res.status(500).json({ error: 'Failed to fetch policy content' });
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

// Edit and propose changes (create branch, commit, PR)
router.post('/:repo/edit', authenticateToken, requireWriterOrAdmin, async (req, res) => {
  try {
    const octokit = await initializeOctokit();
    const { repo } = req.params;
    const { path, content, message, branchName } = req.body;
    const owner = getOrganization();

    // Get the SHA of the main branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main',
    });
    const sha = refData.object.sha;

    // Create a new branch
    const newBranch = branchName || `edit-${Date.now()}`;
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
      message: message || 'Update policy',
      content: Buffer.from(content).toString('base64'),
      branch: newBranch,
      sha: fileSha,
    });

    // Create a PR
    const { data: prData } = await octokit.pulls.create({
      owner,
      repo,
      title: `Update ${path}`,
      head: newBranch,
      base: 'main',
      body: message || 'Policy update',
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
    const { data } = await octokit.repos.createInOrg({
      name: `policy-${name}`,
      description,
      private: false, // or true if needed
    });
    res.json(data);
  } catch (error) {
    console.error('Error creating policy repo:', error);
    res.status(500).json({ error: 'Failed to create policy repo' });
  }
});

module.exports = router;