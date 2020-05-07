
//const lib2 = require('./ConvertData');
function deviceDataView(devicenumber ,device,self) {
    try{

        self.log.info('received data devicenumber: (' + devicenumber + '): ' + JSON.stringify(device));
        var serial = device.serialnumber;
        var ewacSV = device.sv;
        var ewacHV = device.hv;
        var errors = device.errors;

        //Daten sind nicht aktuell -> Meldung anzeigen
       /* if(
            device.data[devicenumber].data.lu
            && isDeviceDataOld(device.data[devicenumber].data.lu)
            || deviceNotSendingData(device.data[devicenumber].data)
        ){
            $('.alert-ph.d32').show();
        }else{
            $('.alert-ph.d32').hide();
        }
*/

         
 
       
        //Notstrommodul prüfen
        var notstrommodul_data = getInValue(device.data[devicenumber].data, '790_2');
        var notstrommodul_binary = (+notstrommodul_data).toString(2);
        var nsm_bit = 0;
        if (notstrommodul_binary.length > 1) {
            nsm_bit = notstrommodul_binary[notstrommodul_binary.length - 2];
        }
        var nsm_vorhanden = false;
        if (nsm_bit == 1) {
            nsm_vorhanden = true;
           
            //Batteriekapazität
            let kapazitaet = getInValue(device.data[devicenumber].data, '93');
            
            self.setObjectNotExists(serial +'.kapazitaet', {
                type: 'state',
                common: {  name: 'kapazitaet' , type: 'string', role: 'indicator',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.kapazitaet'  , {val: kapazitaet, ack: true});

           

        } else {
            let kapazitaet = 0
            self.setObjectNotExists(serial +'.kapazitaet', {
                type: 'state',
                common: {  name: 'kapazitaet' , type: 'string', role: 'indicator',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.kapazitaet'  , {val: kapazitaet, ack: true});
        }

      /*  var leckageClosedWarning = null;
        if (Object.keys(errors).length != 0) {
            if (parseInt(errors[0].type) == 31) {
                localStorage.setItem("batterietest" + serial, null);
                loader('hide');
            }

            if (parseInt(errors[0].type) == 51 || parseInt(errors[0].type) == 52 || parseInt(errors[0].type) == 53 || parseInt(errors[0].type) == 24) {
                if (parseInt(errors[0].type) == 51 || parseInt(errors[0].type) == 52 || parseInt(errors[0].type) == 53)
                    leckageClosedWarning = parseInt(errors[0].type) + 100;
                else
                    leckageClosedWarning = parseInt(errors[0].type);
            } else {
                popupErrorMessage(errors[0].id, errors[0].type, serial, device.devicename, errors[0].ts, errors[0].param);
            }
        }*/

        // Wasserstop abstellen/Leckageschutz öffnen
        /*var leckageschutz_statusflag = getInValue(device.data[devicenumber].data, '792_0');
        var wasserstop = null;
        if (leckageschutz_statusflag == "0") {
            wasserstop = 0;
        } else {
            if (leckageschutz_statusflag.length == 8) {
                wasserstop = leckageschutz_statusflag[0];
            } else {
                wasserstop = 0;
            }
        }

        if (wasserstop != 0) {
            var da = device.data[devicenumber].da;
            var dt = device.data[devicenumber].dt;
            var serial = device.serialnumber;

            var buttonId = da + ':' + dt + ':' + serial + ':i-softleckageschutz_status_label:i-soft_leckageschutz';

            $('#warning_dialog_button_bar').html('<button onclick="$(\'#overlay2\').css(\'display\',\'none\'); back_history();"'
                + 'style="float: left; width: 32%; margin-left: 1%; color: #fff;" class="btn center-block judo_orangebutton">'
                + _lang[GlobalObj['language']].zurueck + '</button><button class="btn center-block judo_orangebutton" style="float: right; width: 64%; margin-right: 1%;" id="' + buttonId + '" onclick="$(\'#overlay2\').css(\'display\',\'none\'); setDeviceConfiguration(\'ws_open\',this.id)">' + _lang[GlobalObj['language']].leckagealarm_beenden + '</button>');
            //+ _lang[GlobalObj['language']].zurueck + '</button><button class="btn center-block judo_orangebutton" style="float: right; width: 64%; margin-right: 1%;" id="' + buttonId + '" onclick="">' + _lang[GlobalObj['language']].leckageschutz_oeffnen + '</button>');

            var messageText = "";
            if (leckageClosedWarning != null) {
                messageText = getErrorMessage(leckageClosedWarning, '', serial);
            }

            $('#warning_dialog_body').html(messageText);
            $('#overlay2').css("display", "block");

        }*/


        //var wasserszene = getInValue(device.data[devicenumber].data, '790_10');
        var waterscene_type = device.waterscene;
        var disable_time = device.disable_time;

        //Eingestellte Wasserhärte
        var wasserHaerte = getInValue(device.data[devicenumber].data, '790_10');
        self.setObjectNotExists(serial +'.wasserHaerte', {
            type: 'state',
            common: {  name: 'wasserHaerte' , type: 'string', role: 'indicator',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.wasserHaerte'  , {val: wasserHaerte, ack: true});

        //Wasserhärte für Normalbetrieb
        var waterscene_normal = device.waterscene_normal;


       // if (ConfigTimestamps[serial + ':config'] == null || Math.round(Date.now() / 1000) - ConfigTimestamps[serial + ':config'] > 15) {
          
           
            // Sleepmodus prüfen
            var standbyMode = getInValue(device.data[devicenumber].data, '792_9');
            self.setObjectNotExists(serial +'.StandbyMode', {
                type: 'state',
                common: {  name: 'StandbyMode' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.StandbyMode'  , {val: standbyMode.toString(), ack: true});
            

          /*  if (standbyMode > 0) {
                var da = device.data[devicenumber].da;
                var dt = device.data[devicenumber].dt;

                var showPopup = false;
                if (localStorage.getItem(serial + "sleepmodus") == null) {
                    showPopup = true;
                } else {
                    var ts = Math.floor(Date.now() / 1000);
                    if (ts - parseInt(localStorage.getItem(serial + "sleepmodus")) > 60) {
                        showPopup = true;
                    }
                }

                if (waterscene_type == "watering") {
                    showPopup = false;
                }

                if (showPopup) {
                    var buttonId = da + ':' + dt + ':' + serial + ':i-soft-leckageschutz_status_label';

                    $('#warning_dialog_button_bar').html('<button onclick="$(\'#overlay2\').css(\'display\',\'none\'); back_history();"'
                        + 'style="float: left; width: 32%; margin-left: 1%; color: #fff;" class="btn center-block judo_orangebutton">'
                        + _lang[GlobalObj['language']].zurueck + '</button><button class="btn center-block judo_orangebutton" style="float: right; width: 64%; margin-right: 1%;" id="' + buttonId + '" onclick="$(\'#overlay2\').css(\'display\',\'none\'); setDeviceConfiguration(\'sleepmode_stop_from_popup\',this.id)">' + _lang[GlobalObj['language']].sleepmodus_beenden + '</button>');

                    $('#warning_dialog_body').html(getErrorMessage(26, standbyMode, serial));
                    $('#overlay2').css("display", "block");
                } else {
                    //$('#warning_dialog').hide();
                }
            }*/

           

            // Wasserhärteeinheit
            var isoft_einheit = parseInt(getInValue(device.data[devicenumber].data, '12'));
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
            var statusflag = parseInt(getInValue(device.data[devicenumber].data, '791_0'));
          
            self.setObjectNotExists(serial +'.regeneration', {
                type: 'state',
                common: {  name: 'regeneration' , type: 'string', role: 'value',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.regeneration'  , {val: statusflag, ack: true});

           /* if (ConfigTimestamps[serial + ':waterscene'] != null && Math.round(Date.now() / 1000) - ConfigTimestamps[serial + ':waterscene'] > 20) {
                //Wasserszenen aktivieren
                $("#i-soft_normal").removeAttr("disabled");
                $("#i-soft_duschen").removeAttr("disabled");
                $("#i-soft_garten").removeAttr("disabled");
                $("#i-soft_heizung").removeAttr("disabled");
                $("#i-soft_waschen").removeAttr("disabled");
                ConfigTimestamps[serial + ':waterscene'] = null;
            }*/

            

            //
            //  Wasserszenen-Menü
            //

            var wassersceneRestzeit = null;
            if (disable_time != "") {
                var cur_ts = Math.floor(Date.now() / 1000);
                var rest_sec = parseInt(disable_time) - cur_ts;
                var hours = null;

                if (rest_sec < 0) {
                    wassersceneRestzeit = "00:00";
                } else {
                    if (rest_sec >= 3600) {
                        hours = Math.ceil(rest_sec / 3600);
                        var h = parseInt(rest_sec / 3600);
                        var m = parseInt((rest_sec - h * 3600) / 60);
                        if (m.toString().length == 1) m = "0" + m;
                        hours = h + ':' + m;
                    } else {
                        var h = "00";
                        var m = parseInt(rest_sec / 60);
                        if (m.toString().length == 1) m = "0" + m;
                        hours = h + ':' + m;
                    }

                    if (hours != null) {
                        //wassersceneRestzeit = _lang[GlobalObj['language']].in_x_std.replace('X', hours);
                        wassersceneRestzeit = hours;
                    }
                }
                self.setObjectNotExists(serial +'.wassersceneRestzeit', {
                    type: 'state',
                    common: {  name: 'wassersceneRestzeit' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.wassersceneRestzeit'  , {val: wassersceneRestzeit, ack: true});
    
            }

            if (waterscene_type == null || waterscene_type.length == 0) waterscene_type = 'normal';

            self.setObjectNotExists(serial +'.waterscene_type', {
                type: 'state',
                common: {  name: 'waterscene_type' , type: 'string', role: 'text',read: true, write: false,}, native: {},
            });
            self.setState(serial +'.waterscene_type'  , {val: waterscene_type, ack: true});


           
           
            

            //Salzfüllstand
            var stand_reichweite = getInValue(device.data[devicenumber].data, '94');
            var salzstand = _lang[GlobalObj['language']].antwortet_nicht,
                reichweite = _lang[GlobalObj['language']].antwortet_nicht;

            var salzstand_rounded = 0;
            if (stand_reichweite.indexOf(':') > -1) {
                reichweite = Math.round(stand_reichweite.split(':')[1] / 7);
                self.setObjectNotExists(serial +'.reichweiteWochen', {
                    type: 'state',
                    common: {  name: 'reichweiteWochen' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.reichweiteWochen'  , {val: reichweite, ack: true});

                salzstand = stand_reichweite.split(':')[0] / 1000;
                self.setObjectNotExists(serial +'.salzstand', {
                    type: 'state',
                    common: {  name: 'salzstand' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.salzstand'  , {val: salzstand, ack: true});

                salzstand_rounded = parseInt(5 * Math.ceil(salzstand / 5));
                self.setObjectNotExists(serial +'.salzstand_rounded', {
                    type: 'state',
                    common: {  name: 'salzstand_rounded' , type: 'string', role: 'text',read: true, write: false,}, native: {},
                });
                self.setState(serial +'.salzstand_rounded'  , {val: salzstand_rounded, ack: true});

            }
          /*  $('#i-soft_int94').html(reichweite);
            var standPercent = salzstand_rounded * 100 / 50;
            if (standPercent > 100) standPercent = 100;
            $('#i-soft_progressbar').html(standPercent + '%');
            $('#i-soft_progressbar').css('width', standPercent + '%');

            //Salzvorrat select-box value setzen
            if (salzstand_rounded > 50) salzstand_rounded = 50;
            $("#i-soft_sel_salzvorrat").val(salzstand_rounded);*/
       // } else {
            //console.log('content update blocked');
        //}
       

       

        //Wasserstop-Daten
        //Max Durchfluss
        var maxDurchfluss = getInValue(device.data[devicenumber].data, '792_1213');
        
        self.setObjectNotExists(serial +'.maxDurchfluss', {
            type: 'state',
            common: {  name: 'maxDurchfluss' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.maxDurchfluss'  , {val: maxDurchfluss.toString(), ack: true});

        //Max Entnahmemenge
        var maxMenge = getInValue(device.data[devicenumber].data, '792_1415');
        self.setObjectNotExists(serial +'.MaxEntnahmemenge', {
            type: 'state',
            common: {  name: 'MaxEntnahmemenge' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.MaxEntnahmemenge'  , {val: maxMenge.toString(), ack: true});
        //Max Entnahmezeit
        var maxZeit = getInValue(device.data[devicenumber].data, '792_1617');
        
        self.setObjectNotExists(serial +'.Entnahmedauer', {
            type: 'state',
            common: {  name: 'Entnahmedauer' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Entnahmedauer'  , {val: maxZeit.toString(), ack: true});
 

        //Gerätenummer
        var geraetenummer = getInValue(device.data[devicenumber].data, '3');
        
        self.setObjectNotExists(serial +'.Geraetenummer', {
            type: 'state',
            common: {  name: 'Geraetenummer' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Geraetenummer'  , {val: geraetenummer.toString(), ack: true});

        //Softwareversion
        var softwareversion = getInValue(device.data[devicenumber].data, '1');
        self.setObjectNotExists(serial +'.Softwareversion', {
            type: 'state',
            common: {  name: 'Softwareversion' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Softwareversion'  , {val: softwareversion.toString(), ack: true});

        //Hardwareversion
        var hardvareversion = getInValue(device.data[devicenumber].data, '2');
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
            common: {  name: 'Hardvareversion' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Hardvareversion'  , {val: ewacHV.toString(), ack: true});


        //nächste Wartung
        var wartung = getInValue(device.data[devicenumber].data, '7').split(':')[0];
        self.setObjectNotExists(serial +'.Wartung', {
            type: 'state',
            common: {  name: 'Wartung' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Wartung'  , {val: wartung.toString(), ack: true});



        //Inbetriebnahmedatum
        var inbetriebnahmedatum = getInValue(device.data[devicenumber].data, '6');
        self.setObjectNotExists(serial +'.inbetriebnahmedatum', {
            type: 'state',
            common: {  name: 'inbetriebnahmedatum' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.inbetriebnahmedatum'  , {val: inbetriebnahmedatum.toString(), ack: true});


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
        var gesamtwassermenge = getInValue(device.data[devicenumber].data, '8');
       // gesamtwassermenge = literToM3(gesamtwassermenge, _lang[GlobalObj['language']].liter);
        self.setObjectNotExists(serial +'.Gesamtwassermenge', {
            type: 'state',
            common: {  name: 'Gesamtwassermenge' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Gesamtwassermenge'  , {val: gesamtwassermenge.toString(), ack: true});


        //Gesamt Regenerationszahl
        var regenerationszahl = getInValue(device.data[devicenumber].data, '791_3031');
        self.setObjectNotExists(serial +'.Regenerationszahl', {
            type: 'state',
            common: {  name: 'Regenerationszahl' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.Regenerationszahl'  , {val: regenerationszahl.toString(), ack: true});


        //Anzahl Wartungen
        var registrierteWartungen = getInValue(device.data[devicenumber].data, '7').split(':')[1];
         self.setObjectNotExists(serial +'.AnzahlWartungen', {
            type: 'state',
            common: {  name: 'AnzahlWartungen' , type: 'string', role: 'text',read: true, write: false,}, native: {},
        });
        self.setState(serial +'.AnzahlWartungen'  , {val: registrierteWartungen.toString(), ack: true});

        //Wasserdurchfluss
        var durchfluss = getInValue(device.data[devicenumber].data, '790_1617');
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