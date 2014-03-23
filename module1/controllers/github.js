var gitHub = require('../helpers/github_api');

exports.getRepo = function(req, res) {
    var user = req.params.user;
    gitHub.repositories(user, function(err, repos) {
        if(err) {
            res.send(500, err.message);
        }else{
            repos = repos.map(function(el) {
                return {
                    name: el.name,
                    url: el.html_url
                };
            });
            res.render('repositories', {owner: user, repos: repos});
        }
    });
};

exports.getCommits = function(req, res) {
    var user = req.params.user;
    var repo = req.params.repo;
    gitHub.commits(user, repo, function(err, commits) {
        if(err) {
            res.send(500, err.message);
        }else{
            commits = commits.map(function(el) {
                return {
                    name: el.commit.author.name,
                    gravID: el.author ? el.author.gravatar_id : '',
                    email: el.commit.author.email,
                    date: el.commit.committer.date,
                    message: el.commit.message,
                    sha: +el.commit.tree.sha.slice(-1)
                };
            });
            res.render('commits', {commits: commits});
        }
    });
};