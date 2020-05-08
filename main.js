'use strict';

  
const utils = require('@iobroker/adapter-core');

const request = require('request');
const requestData = require('request');
var crypto = require('crypto');
//var md5 = require('md5');
 

 

class ISoftSafe extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'ISoftSafe',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

     
    async onReady() {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.log.info('config Password: ' + this.config.Password);
        this.log.info('config Username: ' + this.config.Username);
        const self = this;
        
        var TokenFrommyjudo;
        var UserData ;

        function md51(bytes) {
            if (typeof Buffer.from === 'function') {
              // Modern Buffer API
              if (Array.isArray(bytes)) {
                bytes = Buffer.from(bytes);
              } else if (typeof bytes === 'string') {
                bytes = Buffer.from(bytes, 'utf8');
              }
            } else {
              // Pre-v4 Buffer API
              if (Array.isArray(bytes)) {
                bytes = new Buffer(bytes);
              } else if (typeof bytes === 'string') {
                bytes = new Buffer(bytes, 'utf8');
              }
            }
          
            return crypto.createHash('md5').update(bytes).digest();
          }

          var password_hash = md51(this.config.Password);
          this.log.info('remote request started :' + password_hash);
          
          self.setObjectNotExists('Passwort_Hash', {
            type: 'state',
            common: {  name: 'Passwort_Hash' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState('Passwort_Hash'  , {val: password_hash.toString() , ack: true});



        

        /*var hash = md5(this.config.Password);
        self.setObjectNotExists('Passwort_MD5', {
            type: 'state',
            common: {  name: 'Passwort_MD5' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState('Passwort_MD5'  , {val: hash, ack: true});
       
        this.log.info('remote request started :' + hash);*/

        this.log.info('remote request started');

                request(
                    {
                        url: 'https://www.myjudo.eu/interface/?group=register&command=login&name=login&user=' +this.config.Username +'&password=' + this.config.PasswordMD5 +'&nohash=Service&role=customer' ,                         
                        json: true,
                        time: true,
                        timeout: 4500
                    },
                    (error, response, content) => {
                        self.log.info('remote request done');
                        if (response) {
                            self.log.debug('received data (' + response + '): ' + JSON.stringify(content));
                            self.log.info('received data (' + response + '): ' + JSON.stringify(content));
                            if (!error && response.statusCode == 200) {
                                TokenFrommyjudo =  content.token;
                                self.setObjectNotExists('Token', {
                                    type: 'state',
                                    common: {
                                        name: 'Token',
                                        type: 'string',
                                        role: 'text',
                                        read: true,
                                        write: false,
                                    },
                                    native: {},
                                });
                                self.setState('Token' , {val: TokenFrommyjudo, ack: true});
                                // Get the User Data
                                request(
                                    {
                                        url: 'https://www.myjudo.eu/interface/?token='+TokenFrommyjudo+'&group=register&command=showlocation' ,
                                         
                                        json: true,
                                        time: true,
                                        timeout: 4500
                                    },
                                    (error, response, content) => {
                                        self.log.info('Get User Data request done');
                                        if (response) {
                                            self.log.debug('received data (' + response + '): ' + JSON.stringify(content));
                                            self.log.info('received data (' + response + '): ' + JSON.stringify(content));
                                            if (!error && response.statusCode == 200) 
                                            {                                              
                                                for (var key in content.data)
                                                {
                                                    let i = 0;
                                                    UserData = content.data[key]
                                                    var Adressen = 'Adresse_'+i.toString() +'.';
                                                    //self.log.info('Userdata ' + JSON.stringify(UserData));
                                                    self.setObjectNotExists(Adressen +'Wohnort', {
                                                        type: 'state',
                                                        common: {  name: 'Wohnort' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState(Adressen +'Wohnort'  , {val: UserData.city, ack: true});
                                                    self.setObjectNotExists(Adressen +'PLZ' , {
                                                        type: 'state',
                                                        common: {  name: 'PLZ' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState(Adressen +'PLZ' , {val: UserData.zipcode, ack: true});
                                                    // Strassenname für 
                                                    self.setObjectNotExists(Adressen +'Strasse' , {
                                                        type: 'state',
                                                        common: {  name: 'Strasse' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState(Adressen +'Strasse'  , {val: UserData.street, ack: true});
                                                    // Strassenname für 
                                                    self.setObjectNotExists(Adressen +'Hausnummer' , {
                                                        type: 'state',
                                                        common: {  name: 'Hausnummer' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState(Adressen +'Hausnummer'  , {val: UserData.streetnumber, ack: true});
                                                }
                                                // Strassenname für 
                                                self.setObjectNotExists('JSONAdressen', {
                                                    type: 'state',
                                                    common: {  name: 'JSONAdressen', type: 'string', role: 'json',read: true, write: false,}, native: {},
                                                });
                                                self.setState('JSONAdressen'  , {val: JSON.stringify(content), ack: true});
                                                //  Zeitpunkt der  
                                                self.setObjectNotExists('Zeitpunkt_Update', {
                                                    type: 'state',
                                                    common: {  name: 'Zeitpunkt_Update', type: 'string', role: 'date',read: true, write: false,}, native: {},
                                                });
                                                self.setState('Zeitpunkt_Update'  , {val: Date.now(), ack: true});
                                                
                                                // Jetzt die Geräte daten auslesen
                                                request(
                                                    {  
                                                        url:'https://www.myjudo.eu/interface/?token='+TokenFrommyjudo+'&group=register&command=get%20device%20data',
                                                       json: true,
                                                        time: true,
                                                        timeout: 4500
                                                    },
                                                    (error, response, content) => {
                                                        self.log.info('Get User Device request done');
                                                        if (response) {
                                                            self.log.debug('received data (' + response + '): ' + JSON.stringify(content));
                                                            self.log.info('received data (' + response + '): ' + JSON.stringify(content));
                                                            if (!error && response.statusCode == 200) 
                                                            {   
                
                                                                deviceDataView(0,content,self);
                                                                // Strassenname für 
                                                                self.setObjectNotExists('JSONGeraete', {
                                                                    type: 'state',
                                                                    common: {  name: 'JSONGeraete', type: 'string', role: 'json',read: true, write: false,}, native: {},
                                                                });
                                                                self.setState('JSONGeraete'  , {val: JSON.stringify(content), ack: true});
                
                                                            }else
                                                            {
                                                                self.log.info('Get User Device request done but response.statusCode not 200' + response.statusCode);
                                                            }
                                                        }
                                                        else
                                                        {
                                                            self.log.info('Get User Device request done but no responce errorcode ' +error );
                                                        }
                                                    }
                                                )

                                            }
                                        }
                                    }
                                )
                              
                                
                            }

                        }

       
                    }
                )
                setTimeout(this.stop.bind(this), 20000);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }
}


function deviceDataView(devicenumber ,device,self) {
    try{
        device = device.data[devicenumber]
        self.log.info('received data devicenumber: (' + devicenumber + '): ' + JSON.stringify(device));
        var serial = device.serialnumber;
        var ewacSV = device.sv;
        var ewacHV = device.hv;
        var errors = device.errors;
      
        //Notstrommodul prüfen
        var notstrommodul_data = getInValue(device.data[devicenumber].data, '790_2',self);
        var notstrommodul_binary = (+notstrommodul_data).toString(2);
        var nsm_bit = 0;
        if (notstrommodul_binary.length > 1) {
            nsm_bit = notstrommodul_binary[notstrommodul_binary.length - 2];
        }
        var nsm_vorhanden = false;
        if (nsm_bit == 1) {
            nsm_vorhanden = true;
           
            //Batteriekapazität
            let kapazitaet = getInValue(device.data[devicenumber].data, '93',self);
            
            self.setObjectNotExists(serial +'.kapazitaet', {
                type: 'state',
                common: {  name: 'kapazitaet' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.kapazitaet'  , {val: kapazitaet.toString(), ack: true});

           

        } else {
            let kapazitaet = 0
            self.setObjectNotExists(serial +'.kapazitaet', {
                type: 'state',
                common: {  name: 'kapazitaet' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.kapazitaet'  , {val: kapazitaet.toString(), ack: true});
        }

        //var wasserszene = getInValue(device.data[devicenumber].data, '790_10');
        var waterscene_type = device.waterscene;
        var disable_time = device.disable_time;

        //Eingestellte Wasserhärte
        var wasserHaerte = getInValue(device.data[devicenumber].data, '790_10',self);
        self.setObjectNotExists(serial +'.wasserHaerte', {
            type: 'state',
            common: {  name: 'wasserHaerte' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.wasserHaerte'  , {val: wasserHaerte.toString(), ack: true});

        //Wasserhärte für Normalbetrieb
        var waterscene_normal = device.waterscene_normal;
           
            // Sleepmodus prüfen
            var standbyMode = getInValue(device.data[devicenumber].data, '792_9',self);
            self.setObjectNotExists(serial +'.StandbyMode', {
                type: 'state',
                common: {  name: 'StandbyMode' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.StandbyMode'  , {val: standbyMode.toString(), ack: true});
                

            // Wasserhärteeinheit
            var isoft_einheit = parseInt(getInValue(device.data[devicenumber].data, '12',self));
            var isoftWasserhaertEeinheit = '';
            var unit_relation = 1;
            switch (isoft_einheit) {
                case 0:
                    isoftWasserhaertEeinheit = '°dH';
                    break;
                case 1:
                    isoftWasserhaertEeinheit = '°e';
                    unit_relation = 1.2522;
                    break;
                case 2:
                    isoftWasserhaertEeinheit = '°f';
                    unit_relation = 1.7848;
                    break;
                case 3:
                    isoftWasserhaertEeinheit = 'gr/gal (US), gpg';
                    unit_relation = 1.0426;
                    break;
                case 4:
                    isoftWasserhaertEeinheit = 'ppm';
                    unit_relation = 17.8;
                    break;
                case 5:
                    isoftWasserhaertEeinheit = 'mmol/l';
                    unit_relation = 0.178;
                    break;
                case 6:
                    isoftWasserhaertEeinheit = 'мгл-экв/л (mgeq/l)';
                    unit_relation = 0.3566;
                    break;
            }
            self.setObjectNotExists(serial +'.isoftWasserhaertEeinheit', {
                type: 'state',
                common: {  name: 'isoftWasserhaertEeinheit' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.isoftWasserhaertEeinheit'  , {val: isoftWasserhaertEeinheit, ack: true});

           
             

            //Statusflag Regeneration/Im Betrieb
            var statusflag = parseInt(getInValue(device.data[devicenumber].data, '791_0',self));
          
            self.setObjectNotExists(serial +'.regeneration', {
                type: 'state',
                common: {  name: 'regeneration' , type: 'state', role: 'value',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.regeneration'  , {val: statusflag, ack: true});

          

            //
            //  Wasserszenen-Menü
            //

            var wassersceneRestzeit = "00:00";
            if (disable_time != null && disable_time != "") {
                var cur_ts = Math.floor(Date.now() / 1000);
                var rest_sec = parseInt(disable_time) - cur_ts;
                var hours = null;

                if (rest_sec < 0) {
                    wassersceneRestzeit = "00:00";
                } else {
                    if (rest_sec >= 3600) {
                        hours = Math.ceil(rest_sec / 3600);
                        let h = parseInt(rest_sec / 3600);
                        let m = parseInt((rest_sec - h * 3600) / 60);
                        if (m.toString().length == 1) m = "0" + m;
                        hours = h + ':' + m;
                    } else {
                        let h = "00";
                        let m = parseInt(rest_sec / 60);
                        if (m.toString().length == 1) m = "0" + m;
                        hours = h + ':' + m;
                    }

                    if (hours != null) {
                        //wassersceneRestzeit = _lang[GlobalObj['language']].in_x_std.replace('X', hours);
                        wassersceneRestzeit = hours;
                    }
                }
               
    
            }
            self.setObjectNotExists(serial +'.WassersceneRestzeit', {
                type: 'state',
                common: {  name: 'WassersceneRestzeit' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.WassersceneRestzeit'  , {val: wassersceneRestzeit, ack: true});

            if (waterscene_type == null || waterscene_type.length == 0) waterscene_type = 'normal';

            self.setObjectNotExists(serial +'.Waterscene_type', {
                type: 'state',
                common: {  name: 'Waterscene_type' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.Waterscene_type'  , {val: waterscene_type, ack: true});

 

            //Salzfüllstand
            var stand_reichweite = getInValue(device.data[devicenumber].data, '94',self);
            var salzstand,
                reichweite ;
                self.setObjectNotExists(serial +'.Salzfuellstand', {
                    type: 'state',
                    common: {  name: 'Salzfuellstand' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.Salzfuellstand'  , {val: stand_reichweite, ack: true});

            var salzstand_rounded = 0;
            if (stand_reichweite.indexOf(':') > -1) {
                reichweite = Math.round(stand_reichweite.split(':')[1] / 7);
                self.setObjectNotExists(serial +'.SalzreichweiteWochen', {
                    type: 'state',
                    common: {  name: 'SalzreichweiteWochen' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.SalzreichweiteWochen'  , {val: reichweite.toString(), ack: true});

                salzstand = stand_reichweite.split(':')[0] / 1000;
                self.setObjectNotExists(serial +'.Salzstand', {
                    type: 'state',
                    common: {  name: 'Salzstand' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.Salzstand'  , {val: salzstand.toString(), ack: true});

                salzstand_rounded = parseInt(5 * Math.ceil(salzstand / 5));
                self.setObjectNotExists(serial +'.Salzstand_rounded', {
                    type: 'state',
                    common: {  name: 'Salzstand_rounded' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.Salzstand_rounded'  , {val: salzstand_rounded.toString(), ack: true});

            }
         
       

       

        //Wasserstop-Daten
        //Max Durchfluss
        var maxDurchfluss = getInValue(device.data[devicenumber].data, '792_1213',self);
        
        self.setObjectNotExists(serial +'.MaxDurchfluss', {
            type: 'state',
            common: {  name: 'MaxDurchfluss' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.MaxDurchfluss'  , {val: maxDurchfluss.toString(), ack: true});

        //Max Entnahmemenge
        var maxMenge = getInValue(device.data[devicenumber].data, '792_1415',self);
        self.setObjectNotExists(serial +'.MaxEntnahmemenge', {
            type: 'state',
            common: {  name: 'MaxEntnahmemenge' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.MaxEntnahmemenge'  , {val: maxMenge.toString(), ack: true});
        //Max Entnahmezeit
        var maxZeit = getInValue(device.data[devicenumber].data, '792_1617',self);
        
        self.setObjectNotExists(serial +'.Entnahmedauer', {
            type: 'state',
            common: {  name: 'Entnahmedauer' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Entnahmedauer'  , {val: maxZeit.toString(), ack: true});
 

        //Gerätenummer
        var geraetenummer = getInValue(device.data[devicenumber].data, '3',self);
        
        self.setObjectNotExists(serial +'.Geraetenummer', {
            type: 'state',
            common: {  name: 'Geraetenummer' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Geraetenummer'  , {val: geraetenummer.toString(), ack: true});

        //Softwareversion
        var softwareversion = getInValue(device.data[devicenumber].data, '1',self);
        self.setObjectNotExists(serial +'.Softwareversion', {
            type: 'state',
            common: {  name: 'Softwareversion' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Softwareversion'  , {val: softwareversion.toString(), ack: true});

        //Hardwareversion
        var hardvareversion = getInValue(device.data[devicenumber].data, '2',self);
        self.setObjectNotExists(serial +'.Hardvareversion', {
            type: 'state',
            common: {  name: 'Hardvareversion' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Hardvareversion'  , {val: hardvareversion.toString(), ack: true});


        //EWAC Software Version
        
        self.setObjectNotExists(serial +'.EWACSoftwareVersion', {
            type: 'state',
            common: {  name: 'EWACSoftwareVersion' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.EWACSoftwareVersion'  , {val: ewacSV.toString(), ack: true});


        //EWAC Hardware Version
        
        self.setObjectNotExists(serial +'.EWACHardwareVersion', {
            type: 'state',
            common: {  name: 'EWACHardwareVersion' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.EWACHardwareVersion'  , {val: ewacHV.toString(), ack: true});


        //nächste Wartung
        var wartung = getInValue(device.data[devicenumber].data, '7',self).split(':')[0];
        self.setObjectNotExists(serial +'.Wartung', {
            type: 'state',
            common: {  name: 'Wartung' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Wartung'  , {val: wartung.toString(), ack: true});



        //Inbetriebnahmedatum
        var inbetriebnahmedatum = getInValue(device.data[devicenumber].data, '6',self);
        self.setObjectNotExists(serial +'.Inbetriebnahmedatum', {
            type: 'state',
            common: {  name: 'Inbetriebnahmedatum' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Inbetriebnahmedatum'  , {val: inbetriebnahmedatum.toString(), ack: true});


        //Notstrommodul
        
        self.setObjectNotExists(serial +'.Notstrommodul', {
            type: 'state',
            common: {  name: 'Notstrommodul' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Notstrommodul'  , {val: nsm_vorhanden.toString(), ack: true});



        //
        //  Betriebsdaten-Menü
        //

        //Gesamtwassermenge
        var gesamtwassermenge = getInValue(device.data[devicenumber].data, '8',self);
       // gesamtwassermenge = literToM3(gesamtwassermenge, _lang[GlobalObj['language']].liter);
        self.setObjectNotExists(serial +'.Gesamtwassermenge', {
            type: 'state',
            common: {  name: 'Gesamtwassermenge' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Gesamtwassermenge'  , {val: gesamtwassermenge.toString(), ack: true});


        //Gesamt Regenerationszahl
        var regenerationszahl = getInValue(device.data[devicenumber].data, '791_3031',self);
        self.setObjectNotExists(serial +'.Regenerationszahl', {
            type: 'state',
            common: {  name: 'Regenerationszahl' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Regenerationszahl'  , {val: regenerationszahl.toString(), ack: true});


        //Anzahl Wartungen
        var registrierteWartungen = getInValue(device.data[devicenumber].data, '7',self).split(':')[1];
         self.setObjectNotExists(serial +'.AnzahlWartungen', {
            type: 'state',
            common: {  name: 'AnzahlWartungen' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.AnzahlWartungen'  , {val: registrierteWartungen.toString(), ack: true});

        //Wasserdurchfluss
        var durchfluss = getInValue(device.data[devicenumber].data, '790_1617',self);
        self.setObjectNotExists(serial +'.Wasserdurchfluss', {
            type: 'state',
            common: {  name: 'Wasserdurchfluss' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Wasserdurchfluss'  , {val: durchfluss.toString(), ack: true});
        
    }
    catch(err)
    {
        console.log(err.message);
    }
}





var months = [];
months['Jan'] = 1;
months['Feb'] = 2;
months['Mar'] = 3;
months['Apr'] = 4;
months['May'] = 5;
months['Jun'] = 6;
months['Jul'] = 7;
months['Aug'] = 8;
months['Sep'] = 9;
months['Oct'] = 10;
months['Nov'] = 11;
months['Dec'] = 12;

function getInValue(deviceData, index,self) {

    var value = null, subIndex = null;
    if (index.toString().indexOf('_') > -1) {
        var t = index.toString().split('_');
        index = parseInt(t[0]);
        subIndex = parseInt(t[1]);
    }
    index = parseInt(index);
   // self.log.info('index deviceData : (' + JSON.stringify(deviceData) );
   // var data = (deviceData.data != undefined && deviceData.data != null) ? deviceData.data : "";
    
    var data = (deviceData[index] != undefined && deviceData[index] != null) ? deviceData[index].data : "nix";
    
    //self.log.info('index data : ' + data);
    switch (index) {
        // SW - Version / Get SW_Version
        // 3 Bytes
        case 1:
            var svMinor = parseInt(data.slice(2, 4), 16);
            var svMajor = parseInt(data.slice(4, 6), 16);
            var minor = "";
            if (svMinor < 10) {
                if (svMinor == 0)
                    minor = "0";
                else
                    minor = "0" + svMinor;
            }
            else minor = svMinor;
            value = svMajor + "." + minor + "";
            break;


        // HW - Version / Get_HW_Versionb
        // 2 Bytes
        case 2:
            var hvMinor = parseInt(data.slice(0, 2), 16);
            var hvMajor = parseInt(data.slice(2, 4), 16);
            value = hvMajor + '.' + hvMinor;
            break;


        // Gerätenummer / Get_JDO_SerialNo
        // 4 Bytes unsigned
        case 3:
            if (data.length != 0) {
                var v1 = data.slice(0, 2);
                var v2 = data.slice(2, 4);
                var v3 = data.slice(4, 6);
                var v4 = data.slice(6, 8);
                value = parseInt(v4 + '' + v3 + '' + v2 + '' + v1, 16);
            } else value = "";
            break;


        // Bestellnummer des Gerätes / Get_JDO_OrderNo
        // 4 Bytes unsigned
        case 4:
            if (data.length != 0) {
                var v1 = data.slice(0, 2);
                var v2 = data.slice(2, 4);
                var v3 = data.slice(4, 6);
                var v4 = data.slice(6, 8);
                value = parseInt(v4 + '' + v3 + '' + v2 + '' + v1, 16);
            } else value = "";
            break;


        // Betriebsstundenzähler / Get_runntime
        // 4 Bytes unsigned
        // Minuter 8bit, Stunden 8bit, Tage 16bit
        case 5:
            if (data.length != 0) {
                var minutes = parseInt(data.slice(0, 2), 16);
                var hours = parseInt(data.slice(2, 4), 16);
                var days_low = data.slice(4, 6);
                var days_high = data.slice(6, 8);
                var days = parseInt(days_high + '' + days_low, 16);
                value = days + ':' + hours + ':' + minutes;
            } else value = data;
            break;


        // Inbetriebnahmedatum / Get_init_Date
        // 4 Bytes unsigned
        //alert(data);
        case 6:
            if (data.length != 0) {
                var date = parseInt(data, 16);
                var d = new Date(date * 1000);
                v = d.toString().split(' GMT')[0].split(' ');
                //value = v[2] + '/' + months[v[1]] + '/' + v[3] + ' ' + v[4];
                value = v[2] + '.' + months[v[1]] + '.' + v[3];
                //Thu Jul 14 2016 09:13:54
            } else value = "";
            break;


        // Stunden bis zur nächsten Wartung / Get_Service_Time
        // 6 Bytes unsigned
        // 16 bit Stunden bis zur nächsten Wartung
        // 16 bit Registrierte Wartungen
        // 16 bit Angeforederte Wartungen
        case 7:
            if (data.length != 0) {
                var v1_high = data.slice(0, 2);
                var v1_low = data.slice(2, 4);
                var v1 = Math.floor(parseInt(v1_low + "" + v1_high, 16) / 24);
                var v2_high = data.slice(4, 6);
                var v2_low = data.slice(6, 8);
                var v2 = parseInt(v2_low + "" + v2_high, 16);

                var v3_high = data.slice(8, 10);
                var v3_low = data.slice(10, 12);
                var v3 = parseInt(v3_low + "" + v3_high, 16);

                value = v1 + ':' + v2 + ':' + v3;
            } else value = data;
            break;


        // Gesamtwasserverbrauch / Get_TotalWater
        // 4 Byte
        case 8:
            if (data.length != 0 && data.length == 8) {
                var v1 = data.slice(0, 2);
                var v2 = data.slice(2, 4);
                var v3 = data.slice(4, 6);
                var v4 = data.slice(6, 8);
                var v = v4 + '' + v3 + '' + v2 + '' + v1;

                value = parseInt(v, 16);
                /*if(v > 99)
                    value = (v / 1000).toFixed(2) + " m&sup3;";
                else
                    value = v + ' ' + _lang[GlobalObj['language']].liter;*/

            } else value = 0 + ' Liter';
            break;


        // Weichwassermenge / Get_SoftWater
        // Behandelte Wassermenge
        // 4 Byte
        case 9:
            if (data.length >= 8) {
                var v1 = data.slice(0, 2);
                var v2 = data.slice(2, 4);
                var v3 = data.slice(4, 6);
                var v4 = data.slice(6, 8);
                var v = v4 + '' + v3 + '' + v2 + v1;

                /*v = parseInt(v,16);
                if(v > 99)
                    value = (v / 1000).toFixed(2) + " m&sup3;";
                else
                    value = v + ' ' + _lang[GlobalObj['language']].liter;*/

                value = parseInt(v, 16);
            } else value = 0 +  ' Liter';
            break;


        // Sprache / GET_LANGUAGE
        // 1 Byte
        // 0 - deutsch
        // 1 - englisch
        // 2 - französisch
        // 3 - flämisch
        // 4 - italienisch
        case 10:
            if (data.length != 0) {
                value = parseInt(data, 16);
            } else value = data;
            break;


        // Geräte Einheit / Get_Unit
        // 1 Byte
        // 0 - dH
        // 1 - eH
        // 2 - Fh
        // 3 - gpg
        // 4 - ppm
        // 5 - mmol
        // 6 - mval
        case 12:
            if (data.length != 0) {
                value = parseInt(data, 16);
            } else value = 0;
            break;

        // UP Time des Gerätes
        // 4 Byte
        // Minuten : Stunden : TageLow - TageHigh
        case 14:
            if (data.length != 0) {
                var minuten = parseInt(data.slice(0, 2));
                var stunden = parseInt(data.slice(2, 4));
                var tageLow = data.slice(4, 6);
                var tageHigh = data.slice(6, 8);
                var tage = parseInt(tageHigh + '' + tageLow, 16);
                value = tage + ':' + stunden + ':' + minuten;
            } else value = data;
            break;

        // Rohwasserfaktor2 / Get_RohwasserFaktor2
        // 1 Byte
        case 63:
            if (data.length != 0) {
                value = parseInt(data, 16);
            } else value = data;
            break;


        // Dvgw Regeneration / GetDvgwTime
        // 1 Byte
        case 70:
            if (data.length != 0) {
                value = parseInt(data, 16);
            } else value = data;
            break;


        // Regenerationsverteilung / GetBesalzungsAbbruchVia
        // 1 Byte
        case 78:
            if (data.length != 0) {
                value = parseInt(data, 16);
            } else value = data;
            break;

        // Auslesen der Datentabelle / Get_Tableread
        // 1 byte subcode (32 byte response)
        // SUBCODE 0
        case 790:
            value = "";
            if (data.length == 66) {
                if (subIndex !== null) {
                    data = data.toString().split(':')[1];
                    switch (subIndex) {

                        //Notstrommodul Ja/Nein
                        case 2:
                            value = parseInt(data.slice(2, 4));
                            break;

                        // Anzeige Resthärte
                        case 10:
                            value = parseInt(data.slice(16, 18), 16);
                            break;

                        // Wasserdurchfluss
                        case 1617:
                            var tWW_DURCHFLUSS_LO = parseInt(data.slice(32, 34), 16);
                            var tWW_DURCHFLUSS_HI = parseInt(data.slice(34, 36), 16);
                            value = (tWW_DURCHFLUSS_HI * 256) + tWW_DURCHFLUSS_LO;
                            break;
                    }
                }else{

                }
            }
            break;

        case 791:
            value = "";
            if (data.length == 66) {
                if (subIndex !== null) {
                    data = data.toString().split(':')[1];
                    switch (subIndex) {
                        // Gesamt Regenerationszahl
                        case 3031:
                            var tREGANZAHL_LO = data.slice(60, 62);
                            var tREGANZAHL_HI = data.slice(62, 64);
                            value = parseInt(tREGANZAHL_HI + '' + tREGANZAHL_LO, 16);
                            break;

                        // Statusflag Betrieb/Regeneration
                        case 0:
                            var flag = parseInt(data.slice(0, 2), 16);
                            var flagBinary = (+flag).toString(2);
                            var statusFlag = (flagBinary.length > 0) ? flagBinary[flagBinary.length - 1] : 0;
                            value = statusFlag;
                            break;
                    }
                }else{

                }
            } else value = 0;
            break;

        // Wasserstop Daten
        case 792:
            value = "";
            if (data.length == 66) {
                if (subIndex !== null) {
                    data = data.toString().split(':')[1];
                    switch (subIndex) {

                        // Wasserstop statusflag
                        case 0:
                            var standby = parseInt(data.slice(0, 2),16);
                            var standbyBinary = (+standby).toString(2);
                            value = standbyBinary;
                            break;

                        // Standby Modus - gibt Stunden zurück
                        case 9:
                            var standby = data.slice(18, 20);
                            value = parseInt(standby, 16);
                            break;

                        // eingestellter Urlaubsmodus
                        case 18:
                            var urlaubsmodus = data.slice(36, 38);
                            value = parseInt(urlaubsmodus, 16);
                            break;

                        // eingestellter sleepmoduszeit
                        case 19:
                            var urlaubsmodus = data.slice(38, 40);
                            value = parseInt(urlaubsmodus, 16);
                            break;

                        //Max. Durchfluss - 12-low, 13-high
                        case 1213:
                            var maxDurchflussLow = data.slice(24, 26);
                            var maxDurchflussHigh = data.slice(26, 28);
                            value = parseInt(maxDurchflussHigh + '' + maxDurchflussLow, 16);
                            break;

                        //Max. Entnahmemenge
                        case 1415:
                            var maxMengeLow = data.slice(28, 30);
                            var maxMengeHigh = data.slice(30, 32);
                            value = parseInt(maxMengeHigh + '' + maxMengeLow, 16);
                            break;

                        //Max. Entnahmezeit
                        case 1617:
                            var maxZeitLow = data.slice(32, 34);
                            var maxZeitHigh = data.slice(34, 36);
                            value = parseInt(maxZeitHigh + '' + maxZeitLow, 16);
                            break;
                    }
                }
            }
            break;


        // Sollhärte lesen / Get_SollHärte
        // 4 Byte
        // low(Roh) | high(Roh) | low(Weich) | high(Weich)
        case 89:
            var lRoh = data.slice(0, 2);
            var hRoh = data.slice(2, 4);
            var lWeich = data.slice(4, 6);
            var hWeich = data.slice(6, 8);
            var rohHaerte = parseInt(hRoh + '' + lRoh, 16);
            var weichHaerte = parseInt(hWeich + '' + lWeich, 16);
            value = rohHaerte + ':' + weichHaerte;
            break;


        // Rohhärte lesen / Get_Rohhärte
        // 4 Byte
        // low(Roh) | high(Roh) | low(Weich) | high(Weich)
        case 90:
            var lRoh = data.slice(0, 2);
            var hRoh = data.slice(2, 4);
            var lWeich = data.slice(4, 6);
            var hWeich = data.slice(6, 8);
            var rohHaerte = parseInt(hRoh + '' + lRoh, 16);
            var weichHaerte = parseInt(hWeich + '' + lWeich, 16);
            value = rohHaerte + ':' + weichHaerte;
            break;


        // Ist Mischwasserhärte lesen / Get_IstMischwasserHärte
        // 4 Byte
        // low(Roh) | high(Roh) | low(Weich) | high(Weich)
        case 91:
            var lRoh = data.slice(0, 2);
            var hRoh = data.slice(2, 4);
            var lWeich = data.slice(4, 6);
            var hWeich = data.slice(6, 8);
            var rohHaerte = parseInt(hRoh + '' + lRoh, 16);
            var weichHaerte = parseInt(hWeich + '' + lWeich, 16);
            value = rohHaerte + ':' + weichHaerte;
            break;


        // fixierte Härte lesen / Get_fixedRohHärte
        // 4 Byte
        // low(Roh) | high(Roh) | low(Weich) | high(Weich)
        case 92:
            var lRoh = data.slice(0, 2);
            var hRoh = data.slice(2, 4);
            //var lWeich = data.slice(4, 6);
            //var hWeich = data.slice(6, 8);
            var rohHaerte = parseInt(hRoh + '' + lRoh, 16);
            //var weichHaerte = parseInt(hWeich + '' + lWeich, 16);
            value = rohHaerte;
            break;


        // UPS Status lesen / Get_UPS
        // 6 Byte
        // 8-Bit (unsigned) UPS Version_LO
        // 8-Bit (unsigned) UPS Version_HI
        // 8-Bit (flag)     UPS-Status Bit7 = LOW_BATT; Bit6=Batterietest_läuft; Bit5=0; Bit4=0; Bit3=RelaisOn; Bit2=Batteriebetrieb; Bit1=24VOK; Bit0=Notstrommodul vorhanden
        // 8-Bit (unsigned) UPS (letzte gemessene) Batteriespannung in Prozent
        // 8-Bit (unsigned) UPS (letzte gemessene) Batteriespanung in 0,1V(*10)

        // index 93 Byte 3 - Batteriekapazität
        case 93:
            var kapazitaet = 0;
            if(data.length == 10){
                kapazitaet = parseInt(data.slice(6,8),16);
            }
            value = kapazitaet;
            break;


        // Absoluten Salzstand lesen / GET_SALT_Volume
        // 4 Byte
        // low(Salzgew) | high(Salzgew) | low(Reichweite) | high(Reichweite)
        case 94:
            if (data.length != 0) {
                var lSalzstand = data.slice(0, 2);
                var hSalzstand = data.slice(2, 4);
                var lReichweite = data.slice(4, 6);
                var hReichweite = data.slice(6, 8);
                var salzstand = parseInt(hSalzstand + '' + lSalzstand, 16);
                var reichweite = parseInt(hReichweite + '' + lReichweite, 16);
                value = salzstand + ':' + reichweite;
            } else value = data;
            break;


        // Ausgabe des Salzreichweitemangel lesen / GET_Reichweitenmangel
        // 1 Byte
        case 95:
            if (data.length != 0) {
                value = parseInt(data, 16);
            } else value = data;
            break;

        case 127:
            if (subIndex !== null) {
                switch(subIndex){

                    //Füllmodus
                    case 0:
                        if (data.length != 0) {
                            var d = data.slice(0, 2);
                            value = parseInt(d, 16);
                        } else value = data;
                        break;

                    //Anzahl Wartungen
                    //Byte 17 + 18
                    case 17:
                        //console.log(data);
                        if (data.length >= 38) {
                            var dHigh = data.slice(34, 36);
                            var dLow = data.slice(36, 38);
                            value = parseInt(dLow + "" + dHigh, 16);
                        }
                        break;

                    //Gesamtfüllmenge
                    //Byte 19 + 20 + 21 + 22
                    case 19:
                        if (data.length >= 46) {
                            var d1 = data.slice(38, 40);
                            var d2 = data.slice(40, 42);
                            var d3 = data.slice(42, 44);
                            var d4 = data.slice(44, 46);
                            value = parseInt(d4 + "" + d3 + "" + d2 + "" + d1, 16);
                        }
                        break;

                    case 2914:
                        if (data.length >= 64) {
                            var dHigh = data.slice(58, 60);
                            var dLow = data.slice(60, 62);
                            var intVal = parseInt(dLow + "" + dHigh, 16);
                            value = (+intVal).toString(2);
                            if(value.length < 16){
                                var c = 16 - value.length;
                                for(var i = 0; i < c; i++){
                                    value = "0" + value;
                                }
                            }
                        } else value = data;
                        break;

                    case 2915:

                        break;

                    //Fülldruck
                    case 1:
                        if (data.length != 0) {
                            var d = data.slice(2, 4);
                            value = parseInt(d, 16);
                        } else value = data;
                        break;

                    //Anzahl Füllzyklen
                    case 2:
                        if (data.length > 6) {
                            var d = data.slice(4, 6);
                            value = parseInt(d, 16);
                        } else value = data;
                        break;

                    //aktueller Leitwert
                    case 3:
                        if (data.length > 10) {
                            var d1 = data.slice(6, 8);
                            var d2 = data.slice(8, 10);
                            value = parseInt(d2 + "" + d1, 16);
                        }
                        break;

                    //Aktuelle Füllmenge in Liter
                    case 7:
                        if (data.length > 16) {
                            var dHigh = data.slice(14, 16);
                            var dLow = data.slice(16, 18);
                            value = parseInt(dLow + "" + dHigh, 16);
                        }else value = data;
                        break;

                    case 11:
                        if(data.length > 24){
                            var d = data.slice(22,24);
                            value = parseInt(d,16);
                        }
                        break;

                    //Anzahl PURE Patronen
                    case 13:
                        if(data.length > 28){
                            var dHigh = data.slice(26, 28);
                            var dLow = data.slice(28, 30);
                            value = parseInt(dLow + "" + dHigh, 16);
                        }else value = data;
                        break;

                    //Anzahl SOFT Patronen
                    case 15:
                        if(data.length > 28){
                            var dHigh = data.slice(30, 32);
                            var dLow = data.slice(32, 34);
                            value = parseInt(dLow + "" + dHigh, 16);
                        }else value = data;
                        break;

                    case 23:
                        if(data.length > 54){
                            var d1 = data.slice(46, 48);
                            var d2 = data.slice(48, 50);
                            var d3 = data.slice(50, 52);
                            var d4 = data.slice(52, 54);
                            value = parseInt(d4 + "" + d3 + "" + d2 + "" + d1, 16);
                        }
                        break;
                }
            }
            break;

        //Get Limits Data
        case 129:
            if (subIndex !== null) {
                switch(subIndex){

                    //Sprache
                    case 0:
                        if(data.length >= 2){
                            var d = data.slice(0,2);
                            value = parseInt(d,16);
                        }
                        break;

                    //Einheit Wasserhärte
                    case 1:
                        if(data.length >= 4){
                            var d = data.slice(2,4);
                            value = parseInt(d,16);
                        }
                        break;

                    /*//Rohwasserhärte
                    case 2:
                        if(data.length >= 6){
                            var d = data.slice(4,6);
                            value = parseInt(d,16);
                        }
                        break;*/

                    //Patronentyp
                    case 3:
                        if(data.length >= 8){
                            var d = data.slice(6,8);
                            value = parseInt(d,16);
                        }else value = data;
                        break;

                    /*case 4:
                        if(data.length >= 10){
                            var d = data.slice(8,10);
                            value = parseInt(d,16);
                        }else value = data;
                        break;*/

                    //max anzahl füllzyklen
                    case 5:
                        if(data.length >= 12){
                            var d = data.slice(10,12);
                            value = parseInt(d,16);
                        }
                        break;

                    //maximaler Fülldruck
                    case 6:
                        if(data.length >= 14){
                            var d = data.slice(12,14);
                            value = parseInt(d,16);
                        }
                        break;

                    /*case 7:
                        if(data.length >= 16){
                            var d = data.slice(14,16);
                            value = parseInt(d,16);
                        }
                        break;*/

                    //Rohwasserhärte
                    case 8:
                        if(data.length >= 18){
                            var d = data.slice(16,18);
                            value = parseInt(d,16);
                        }
                        break;

                    //maximaler Fülldauer in Min
                    //Byte 10 + 11
                    case 10:
                        if(data.length >= 24){
                            var d1 = data.slice(20,22);
                            var d2 = data.slice(22,24);
                            value = parseInt(d2 + "" + d1,16);
                        }
                        break;

                    //maximaler Füllmenge in Liter
                    //Byte 12 + 13
                    case 12:
                        if(data.length >= 28){
                            var d1 = data.slice(24,26);
                            var d2 = data.slice(26,28);
                            value = parseInt(d2 + "" + d1,16);
                        }
                        break;

                    case 14:
                        if(data.length >= 30){
                            var d = data.slice(28,30);
                            value = parseInt(d,16);
                        }
                        break;

                    /*case 15:
                        if(data.length >= 34){
                            var d1 = data.slice(30,32);
                            var d2 = data.slice(32,34);
                            value = parseInt(d2 + "" + d1, 16);
                        }
                        break;*/

                        //Max Leitwert
                        //Byte 18 + 19
                    case 18:
                        if(data.length >= 40){
                            var d1 = data.slice(36,38);
                            var d2 = data.slice(38,40);
                            value = parseInt(d2 + "" + d1,16);
                        }
                        break;

                    //Patronenkapazität nur bei pure frei & soft frei
                    //Byte 20 + 21 + 22 + 23
                    case 20:
                        if(data.length == 48){
                            var d1 = data.slice(40,42);
                            var d2 = data.slice(42,44);
                            var d3 = data.slice(44,46);
                            var d4 = data.slice(46,48);
                            value = parseInt(d4 + "" + d3 + "" + d2 + "" + d1, 16);
                        }
                        break;
                }
            }
            break;







        //-----------------------------------------------------------------------------------------//


        case 530:
            // Auslesen der Datentabelle
            // 1 byte subcode (32 byte response)
            // SUBCODE 0

            //data = "0:04000F28E00011000800140094029600000000000000000000001702B8005300";
            value = "";
            if (data.length == 66) {
                if (subIndex !== null) {

                    data = data.toString().split(':')[1];
                    switch (subIndex) {

                        case 0:
                            value = parseInt(data.slice(0, 2), 16);
                            break;
                        // tSOLL_HAERTE
                        case 8:
                            value = parseInt(data.slice(16, 18), 16);
                            break;

                        // tIST_HAERTE_SHOW_HAERTE2
                        case 9:
                            value = parseInt(data.slice(18, 20), 16);
                            break;

                        // tROHWASSER_HAERTE2
                        case 10:
                            value = parseInt(data.slice(20, 22), 16);
                            break;

                        // tLEITWERT
                        case 12:
                            var tLEITWERT_LO = parseInt(data.slice(24, 26), 16);
                            var tLEITWERT_HI = parseInt(data.slice(26, 28), 16);
                            value = (tLEITWERT_HI * 256) + tLEITWERT_LO;
                            break;

                        // tTEMPERATUR
                        case 14:
                            var tTEMPERATUR_LO = parseInt(data.slice(28, 30), 16);
                            var tTEMPERATUR_HI = parseInt(data.slice(30, 32), 16);
                            value = (tTEMPERATUR_HI * 256) + tTEMPERATUR_LO;
                            break;

                        // tRW_DURCHFLUSS
                        case 16:
                            var tRW_DURCHFLUSS_LO = parseInt(data.slice(32, 34), 16);
                            var tRW_DURCHFLUSS_HI = parseInt(data.slice(34, 36), 16);
                            value = (tRW_DURCHFLUSS_HI * 256) + tRW_DURCHFLUSS_LO;
                            break;

                        // tWW_DURCHFLUSS
                        case 18:
                            var tWW_DURCHFLUSS_LO = parseInt(data.slice(36, 38), 16);
                            var tWW_DURCHFLUSS_HI = parseInt(data.slice(38, 40), 16);
                            value = (tWW_DURCHFLUSS_HI * 256) + tWW_DURCHFLUSS_LO;
                            break;

                        // tROHWASSER_HAERTE1
                        case 26:
                            value = parseInt(data.slice(52, 54), 16);
                            break;
                    }
                } else {
                    var tERROR_BYTE = parseInt(data.toString().slice(0, 2), 16);
                    var tNULL_BYTE = parseInt(data.slice(2, 4), 16);
                    var tINITIAL_STATUS = parseInt(data.slice(4, 6), 16);
                    var tMOTOR_FLAG = parseInt(data.slice(6, 8), 16);
                    var tICON_BYTE = parseInt(data.slice(8, 10), 16);
                    var tICON_BYTE2 = parseInt(data.slice(10, 12), 16);
                    var tsecond_flag = parseInt(data.slice(12, 14), 16);
                    var tWS_STATUS_FLAG = parseInt(data.slice(14, 16), 16);
                    var tSOLL_HAERTE = parseInt(data.slice(16, 18), 16);
                    var tIST_HAERTE_SHOW = parseInt(data.slice(18, 20), 16);
                    var tROHWASSER_HAERTE2 = parseInt(data.slice(20, 22), 16);
                    var tKorrektur_Haerte = parseInt(data.slice(22, 24), 16);
                    var tLEITWERT_LO = parseInt(data.slice(24, 26), 16);
                    var tLEITWERT_HI = parseInt(data.slice(26, 28), 16);
                    var ttemperatur_lo = parseInt(data.slice(28, 30), 16);
                    var ttemperatur_HI = parseInt(data.slice(30, 32), 16);

                    var tRW_DURCHFLUSS_LO = parseInt(data.slice(32, 34), 16);
                    var tRW_DURCHFLUSS_HI = parseInt(data.slice(34, 36), 16);
                    var tWW_DURCHFLUSS_LO = parseInt(data.slice(36, 38), 16);
                    var tWW_DURCHFLUSS_HI = parseInt(data.slice(38, 40), 16);
                    //var ??? = parseInt(data.slice(40,42), 16);
                    //var ??? = parseInt(data.slice(42,44), 16);
                    //var ??? = parseInt(data.slice(44,46), 16);
                    //var ??? = parseInt(data.slice(46,48), 16);
                    var tRohwasser_schnitt_lo = parseInt(data.slice(48, 50), 16);
                    var tRohwasser_schnitt_hi = parseInt(data.slice(50, 52), 16);
                    var tROHWASSER_HAERTE1 = parseInt(data.slice(52, 54), 16);
                    //var ??? = parseInt(data.slice(54,56), 16);
                    var tCVA = parseInt(data.slice(56, 58), 16);
                    var tDIP1 = parseInt(data.slice(58, 60), 16);
                    var tVSV_WINKEL_LO = parseInt(data.slice(60, 62), 16);
                    var tVSV_WINKEL_HI = parseInt(data.slice(62, 64), 16);


                    value += "tERROR_BYTE : " + tERROR_BYTE + "<br>";
                    value += "tNULL_BYTE : " + tNULL_BYTE + "<br>";
                    value += "tINITIAL_STATUS : " + tINITIAL_STATUS + "<br>";
                    value += "tMOTOR_FLAG : " + tMOTOR_FLAG + " - " + getBitmask(tMOTOR_FLAG) + "<br>";
                    value += "tICON_BYTE : " + tICON_BYTE + " - " + getBitmask(tICON_BYTE) + "<br>";
                    value += "tICON_BYTE2 : " + tICON_BYTE2 + " - " + getBitmask(tICON_BYTE2) + "<br>";
                    value += "tsecond_flag : " + tsecond_flag + "<br>";
                    value += "tWS_STATUS_FLAG : " + tWS_STATUS_FLAG + "<br>";
                    value += "tSOLL_HAERTE : " + tSOLL_HAERTE + "<br>";
                    value += "tIST_HAERTE_SHOW : " + tIST_HAERTE_SHOW + "<br>";
                    value += "tROHWASSER_HAERTE2 : " + tROHWASSER_HAERTE2 + "<br>";
                    value += "tKorrektur_Haerte : " + tKorrektur_Haerte + "<br>";
                    value += "tLEITWERT_LO : " + tLEITWERT_LO + "<br>";
                    value += "tLEITWERT_HI : " + tLEITWERT_HI + "<br>";
                    value += "ttemperatur_lo : " + ttemperatur_lo + "<br>";
                    value += "ttemperatur_HI : " + ttemperatur_HI + "<br>";
                    value += "tRW_DURCHFLUSS_LO : " + tRW_DURCHFLUSS_LO + "<br>";
                    value += "tRW_DURCHFLUSS_HI : " + tRW_DURCHFLUSS_HI + "<br>";
                    value += "tWW_DURCHFLUSS_LO : " + tWW_DURCHFLUSS_LO + "<br>";
                    value += "tWW_DURCHFLUSS_HI : " + tWW_DURCHFLUSS_HI + "<br>";
                    value += "tRohwasser_schnitt_lo : " + tRohwasser_schnitt_lo + "<br>";
                    value += "tRohwasser_schnitt_hi : " + tRohwasser_schnitt_hi + "<br>";
                    value += "tROHWASSER_HAERTE1 : " + tROHWASSER_HAERTE1 + "<br>";
                    value += "tCVA : " + tCVA + "<br>";
                    value += "tDIP1 : " + tDIP1 + "<br>";
                    value += "tVSV_WINKEL_LO : " + tVSV_WINKEL_LO + "<br>";
                    value += "tVSV_WINKEL_HI : " + tVSV_WINKEL_HI + "<br>";
                }
            } else
                value = "";

            break;

        case 531:
            // Auslesen der Datentabelle
            // 1 byte subcode (32 byte response)
            // SUBCODE 1

            //var data = "1:f10038BB31690000010000000000000000000000000000000000910C00000000";

            value = "";
            if (data.length == 66) {
                if (subIndex !== null) {

                    var d = data.split(':')[1];

                    switch (subIndex) {

                        // tSTATUS_FLAG
                        case 0:
                            x = parseInt(d.slice(0, 2), 16);
                            value = (+x).toString(2);
                            break;

                        // tSALZMANGEL_REG_COUNTER
                        case 29:
                            value = parseInt(d.slice(58, 60), 16);
                            break;

                        // tSTATUS_FLAG
                        case 30:
                            var tREGANZAHL_LO = parseInt(d.slice(60, 62), 16);
                            var tREGANZAHL_HI = parseInt(d.slice(62, 64), 16);

                            value = (tREGANZAHL_HI * 256) + tREGANZAHL_LO;
                            break;
                    }
                } else {
                    var d = data.split(':')[1];

                    var tSTATUS_FLAG = parseInt(d.toString().slice(0, 2), 16);
                    var tREGENERATION_STEP = parseInt(d.slice(2, 4), 16);
                    var tCHLOR_MINUTEN_TIMER = parseInt(d.slice(4, 6), 16);
                    //var NULL = parseInt(d.slice(6,8), 16);
                    var tBECHLORUNGS_ABSTAND = parseInt(d.slice(8, 10), 16);
                    var tDVGW_TIMER = parseInt(d.slice(10, 12), 16);
                    var tWW_LITER_LO = parseInt(d.slice(12, 14), 16);
                    var tWW_LITER_HI = parseInt(d.slice(14, 16), 16);
                    var tHALL2_Sync_Counter = parseInt(d.slice(16, 18), 16);
                    var tHALL2_SYNC_MIRROR = parseInt(d.slice(18, 20), 16);
                    var tSALZ_TIMER_LEFT_LO = parseInt(d.slice(20, 22), 16);
                    var tSALZ_TIMER_LEFT_HI = parseInt(d.slice(22, 24), 16);
                    var tSALZ_TIMER_RECHTS_LO = parseInt(d.slice(24, 26), 16);
                    var tSALZ_TIMER_RECHTS_HI = parseInt(d.slice(26, 28), 16);
                    var tBESALZUNGSTIMER_LO = parseInt(d.slice(28, 30), 16);
                    var tBESALZUNGSTIMER_HI = parseInt(d.slice(30, 32), 16);

                    var tSALZ_UP_TIMER_LO = parseInt(d.toString().slice(32, 34), 16);
                    var tSALZ_UP_TIMER_HI = parseInt(d.toString().slice(34, 36), 16);
                    var tFUELL_ZEIT_LO = parseInt(d.toString().slice(36, 38), 16);
                    var tFUELL_ZEIT_HI = parseInt(d.toString().slice(38, 40), 16);
                    var tR_SEKUNDEN_TIMER = parseInt(d.toString().slice(40, 42), 16);
                    var tR_MINUTEN_TIMER = parseInt(d.toString().slice(42, 44), 16);
                    var tANA_CHLOR_LO = parseInt(d.toString().slice(44, 46), 16);
                    var tANA_CHLOR_HI = parseInt(d.toString().slice(46, 48), 16);

                    //var ??? = parseInt(d.slice(48,50), 16);
                    //var ??? = parseInt(d.slice(50,52), 16);

                    var tEH_WINKEL_LO = parseInt(d.slice(52, 54), 16);
                    var tEH_WINKEL_HI = parseInt(d.slice(54, 56), 16);
                    var tREGANZAHL_SALZ = parseInt(d.slice(56, 58), 16);
                    var tSALZMANGEL_REG_COUNTER = parseInt(d.slice(58, 60), 16);
                    var tREGANZAHL_LO = parseInt(d.slice(60, 62), 16);
                    var tREGANZAHL_HI = parseInt(d.slice(62, 64), 16);

                    value += "tSTATUS_FLAG : " + tSTATUS_FLAG + "<br>";
                    value += "tREGENERATION_STEP : " + tREGENERATION_STEP + "<br>";
                    value += "tCHLOR_MINUTEN_TIMER : " + tCHLOR_MINUTEN_TIMER + "<br>";
                    value += "tBECHLORUNGS_ABSTAND : " + tBECHLORUNGS_ABSTAND + "<br>";
                    value += "tDVGW_TIMER : " + tDVGW_TIMER + "<br>";
                    value += "tWW_LITER_LO : " + tWW_LITER_LO + "<br>";
                    value += "tWW_LITER_HI : " + tWW_LITER_HI + "<br>";
                    value += "tHALL2_Sync_Counter : " + tHALL2_Sync_Counter + "<br>";
                    value += "tHALL2_SYNC_MIRROR : " + tHALL2_SYNC_MIRROR + "<br>";
                    value += "tSALZ_TIMER_LEFT_LO : " + tSALZ_TIMER_LEFT_LO + "<br>";
                    value += "tSALZ_TIMER_LEFT_HI : " + tSALZ_TIMER_LEFT_HI + "<br>";
                    value += "tSALZ_TIMER_RECHTS_LO : " + tSALZ_TIMER_RECHTS_LO + "<br>";
                    value += "tSALZ_TIMER_RECHTS_HI : " + tSALZ_TIMER_RECHTS_HI + "<br>";
                    value += "tBESALZUNGSTIMER_LO : " + tBESALZUNGSTIMER_LO + "<br>";
                    value += "tBESALZUNGSTIMER_HI : " + tBESALZUNGSTIMER_HI + "<br>";
                    value += "tSALZ_UP_TIMER_LO : " + tSALZ_UP_TIMER_LO + "<br>";
                    value += "tSALZ_UP_TIMER_HI : " + tSALZ_UP_TIMER_HI + "<br>";
                    value += "tFUELL_ZEIT_LO : " + tFUELL_ZEIT_LO + "<br>";
                    value += "tFUELL_ZEIT_HI : " + tFUELL_ZEIT_HI + "<br>";
                    value += "tR_SEKUNDEN_TIMER : " + tR_SEKUNDEN_TIMER + "<br>";
                    value += "tR_MINUTEN_TIMER : " + tR_MINUTEN_TIMER + "<br>";
                    value += "tANA_CHLOR_LO : " + tANA_CHLOR_LO + "<br>";
                    value += "tANA_CHLOR_HI : " + tANA_CHLOR_HI + "<br>";
                    value += "tEH_WINKEL_LO : " + tEH_WINKEL_LO + "<br>";
                    value += "tEH_WINKEL_HI : " + tEH_WINKEL_HI + "<br>";
                    value += "tREGANZAHL_SALZ : " + tREGANZAHL_SALZ + "<br>";
                    value += "tSALZMANGEL_REG_COUNTER : " + tSALZMANGEL_REG_COUNTER + "<br>";
                    value += "tREGANZAHL_LO : " + tREGANZAHL_LO + "<br>";
                    value += "tREGANZAHL_HI : " + tREGANZAHL_HI + "<br>";
                }
            }
            //value = v;
            break;
    }
    return value;
}

function getBitmask(x) {
    var bits = [128, 64, 32, 16, 8, 4, 2, 1];

    var bitmask = [];

    for (var i = 0; i < bits.length; i++) {
        if (bits[i] <= x) {
            bitmask.push(bits[i]);
            x -= bits[i];
        }
    }

    return JSON.stringify(bitmask.reverse());
}


// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new ISoftSafe(options);
} else {
    // otherwise start the instance directly
    new ISoftSafe();
}