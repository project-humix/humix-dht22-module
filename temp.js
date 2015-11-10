var log = require('logule').init(module, 'temp');
var HumixSense = require('node-humix-sense')
 
var child = require('child_process');
var proc;

var config = {
    "moduleName":"dht22",
    "commands" : [],
    "events" : ["temp","humid"],
    "debug": true
}

var humix = new HumixSense(config);

var humixSensor;

humix.on('connection', function(humixSensorModule){
    humixSensor = humixSensorModule;
    
    console.log('Communication with humix-sense is now ready. hsm:'+humixSensor);
});



function getSensorData(){

    proc = child.exec("sudo ./loldht 7", function(err,data){

        if(err){

            log.error("Error:"+err.toString());
        }

        var str = data.toString(), lines = str.split(/(\r?\n)/g);
        for (var i=0; i<lines.length; i++) {
            
            if(lines[i].indexOf("Humidity") != -1){

                log.info('Parsed Data: '+ lines[i]);

                var s = lines[i];
                var hindex = s.indexOf('=');
                var pindex = s.indexOf('%');
                var humid_str = s.substring(hindex+1,pindex).trim();
                log.info("humid:"+humid_str);


                s = s.substring(pindex);

                hindex = s.indexOf('=');
                pindex = s.indexOf('*');

                var temp_str = s.substring(hindex+1,pindex).trim();
                log.info("temp:"+temp_str);

                var temp_data = {

                           "temp" : parseInt(temp_str)
                };

                
                var humid_data = {
                        "humid" : parseInt(humid_str)
                };
                
                log.info("Temperature:"+JSON.stringify(temp_data));
                log.info("Humidity:"+JSON.stringify(humid_data));
                humixSensor.event('temp',JSON.stringify(temp_data));
                humixSensor.event('humid',JSON.stringify(humid_data));
                
                
            }
        }        
    });
    
}

setInterval(function(){
    getSensorData();
    
},5000);
