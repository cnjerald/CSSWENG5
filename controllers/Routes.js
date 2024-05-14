const { timeEnd, info } = require('console');
const responder = require('../models/Responder');
const fs = require('fs');

function add(server){

    server.get('/', function(req, resp){
        resp.render('mainpage',{
          layout: 'mainpageIndex',
          title: 'mainpage'
        });
    });

   responder.sampleFunction("Passed Parameter: Hello World").then(output => {
        console.log(output);





   });






}



module.exports.add = add;