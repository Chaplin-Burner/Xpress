const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = express.Router({ mergeParams: true });

issuesRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Issue WHERE Issue.series_id = $seriesId`;
    const value = { $seriesId: req.params.seriesId };
    db.all(sql, value, (error, issues) => {
        if (error) {
            next(error);
        } else if (issues) {
            res.status(200).json({ issues });
        } else {
            res.sendStatus(500);
        }
    })
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const artistSql = `SELECT * FROM Artist WHERE Artist.id = $artistId`;
    const artistValues = { $artistId: artistId };
    db.get(artistSql, artistValues, (error, artist) => {
        if (error) {
            next(error);
        } else {
            if (!name || !issueNumber || !publicationDate || !artist) {
                return res.sendStatus(400);
            }

            const sql = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_Id)
                         VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`;
            const values = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: req.params.seriesId
            };
            db.run(sql, values, function (error) {
                if (error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
                        (err, issue) => {
                            if (err) {
                                res.sendStatus(500);
                            } else {
                                res.status(201).json({ issue });
                            }
                        });
                }
            })
        }
    });
})

issuesRouter.param('issueId', (req, res, next, issueId) => {
    const sql = `SELECT * FROM Issue WHERE issue.id = $issueId`;
    const value = { $issueId: issueId };
    db.get(sql, value, (error, issue) => {
        if(error) {
            next(error);
        } else if (issue) {
            req.issue = issue;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const artistSql = `SELECT * FROM Artist WHERE Artist.id = $artistId`;
    const artistValue = { $artistId: artistId};
    db.get(artistSql, artistValue, (error, artist) => {
        if (error) {
            next(error);
        } else {
            if (!name || !issueNumber || !publicationDate || !artist) {
                return res.sendStatus(400);
            }
            const sql = `UPDATE Issue
                         SET
                         name = $name,
                         issue_number = $issueNumber,
                         publication_date = $publicationDate,
                         artist_id = $artistId,
                         series_id = $seriesId
                         WHERE Issue.id = $issueId`;
            const values = {
                $name : name,
                $issueNumber : issueNumber,
                $publicationDate : publicationDate,
                $artistId : artistId,
                $seriesId :req.params.seriesId,
                $issueId : req.params.issueId
            };
            db.run(sql, values, (error) => {
                if(error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, 
                    (error, issue) => {
                        if (error) {
                            res.sendStatus(500);
                        } else {
                            res.status(200).send({issue});
                        }
                    })
                }
            });
        }
    })
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    const sql = `DELETE FROM Issue WHERE Issue.id = $issueId`;
    const value = {$issueId : req.params.issueId};
    db.run(sql, value, (error) => {
        if(error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    })
});



module.exports = issuesRouter;