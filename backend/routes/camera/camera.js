const mongoose       = require('mongoose');
const passport       = require('passport');
const router         = require('express').Router();
const auth           = require('../auth');
const fs             = require('fs');
const gphoto2        = require('gphoto2');

var   gphoto = new gphoto2.GPhoto2();

// Negative value or undefined will disable logging, levels 0-4 enable it.
gphoto.setLogLevel(1);
gphoto.on('log', function (level, domain, message) {
      console.log(domain, message);
});

var camera = null;
var camera_list = [];

function listCameras() {
    camera = null;
    return(
        gphoto.list( (list) => {
            camera_list = list;
            if( camera_list.length > 0 ) {
                camera = list[0];
            }
        }));
}

//Retrieve/refresh cameras
router.get('/list', auth.required, (req, res, next) => {
    camera = null;
    gphoto.list( (list) => {
        camera_list = list;
        if( camera_list.length > 0 ) {
            camera = list[0];
        }
        res.json(camera_list);
    });
});

//Set camera to a particular camera
router.put('/set/:index', auth.required, (req, res, next) => {
    let index = req.params.index;
    if( index < list.length ) {
        camera = list[index];
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

//Get settings retrieves the current settings for a camera
router.get('/settings', auth.required, (req, res, next) => {
    camera.getConfig( (err, settings) => {
        if( err ) {
            res.sendStatus(400);
        } else {
            res.json(settings);
        }
    });
});

//Put saves settings to camera
router.put('/settings', auth.required, (req, res, next) => {
    return;
});

//Take a picture from camera and download image
router.get('/capture', auth.required, (req, res, next) => {
    // Take picture and keep image on camera
    camera.takePicture({
        download: true,
        keep: false
    }, function (err, data) {
        if( err ) {
            res.sendStatus(400);
        } else {
            fs.writeFileSync(__dirname + '/picture.jpg', data);
            res.json({data: data});
        }
    });
});

//Preview
router.get('/preview', auth.required, (req, res, next) => {
    // Take picture and keep image on camera
    camera.takePicture({
        preview: true,
        download: true
    }, function (err, data) {
        if( err ) {
            res.sendStatus(400);
        } else {
            res.json({data: data});
        }
    });
});

module.exports = router;