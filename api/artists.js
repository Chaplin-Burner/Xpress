const express = require('express');
const sqlite3 = require('sqlite3');


const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')
const artistsRouter = express.Router();

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist
            WHERE Artist.id = $artistId`,
        {
            $artistId: artistId
        },
        (error, artist) => {
            if(error) {
                next(error);
            } else if (artist){
                req.artist = artist;
                next();
            } else {
                res.sendStatus(404);
            };
        });
})

artistsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist
            WHERE Artist.is_currently_employed = 1`,
        (err, artists) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({ artists: artists });
            }
        });
});

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist : req.artist});
});

artistsRouter.post('/', (req, res, next) => {
    const artistReq = req.body.artist;
    const name = artistReq.name;
    const dateOfBirth = artistReq.dateOfBirth;
    const biography = artistReq.biography;
    const isCurrentlyEmployed = artistReq.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    
    db.run(`INSERT INTO Artist
            (name, date_of_birth, biography, is_currently_employed)
            VALUES 
            ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`,
            {
                $name : name,
                $dateOfBirth: dateOfBirth,
                $biography : biography,
                $isCurrentlyEmployed : isCurrentlyEmployed
            },
            function(error) {
                if(error) {
                    next(error);
                } else {
                    db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
                    (error, artist) => {
                        if(error) {
                            res.sendStatus(500);
                        } else {
                            res.status(201).json({artist});
                        };
                    });
                }
            })
});

artistsRouter.put('/:artistId', (req, res, next) => {
    const artistReq = req.body.artist;
    const name = artistReq.name;
    const dateOfBirth = artistReq.dateOfBirth;
    const biography = artistReq.biography;
    const isCurrentlyEmployed = artistReq.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }

    const sql = `UPDATE Artist
                 SET name = $name,
                 date_of_birth = $dateOfBirth,
                 biography = $biography,
                 is_currently_employed = $isCurrentlyEmployed
                 WHERE Artist.id = $artistId`;
    const values = {
        $name : name,
        $dateOfBirth : dateOfBirth,
        $biography : biography,
        $isCurrentlyEmployed : isCurrentlyEmployed,
        $artistId : req.params.artistId
    };

    db.run(sql, values, (error) => {
        if(error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
            (error, artist) => {
                if(error) {
                    res.sendStatus(500);
                } else {
                    res.status(200).json({artist : artist});
                }
            });
        };
    })
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    const sql = `UPDATE Artist
                SET is_currently_employed = $isCurrentlyEmployed
                WHERE Artist.id = $artistId`;
    const values = {
        $isCurrentlyEmployed : 0,
        $artistId : req.params.artistId
    };

    db.run(sql, values, (error) => {
        if(error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
            (error, artist) => {
                if(error) {
                    res.sendStatus(500);
                } else {
                    res.status(200).json({artist : artist});
                }
            }); 
        };
    })
});





module.exports = artistsRouter;