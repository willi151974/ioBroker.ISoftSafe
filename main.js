'use strict';

 

 
const utils = require('@iobroker/adapter-core');

const request = require('request');

 

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



        this.log.info('remote request started');

                request(
                    {
                        url: 'https://www.myjudo.eu/interface/?group=register&command=login&name=login&user=' +this.config.Username +'&password=2edb3ccd0646f33644988ffa52a04b0d&nohash=Service&role=customer' ,                         
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
                                        role: 'indicator',
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
                                                    self.setObjectNotExists('Wohnort'+i.toString, {
                                                        type: 'state',
                                                        common: {  name: 'Wohnort'+i.toString, type: 'string', role: 'indicator',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState('Wohnort'+i.toString , {val: UserData.city, ack: true});
                                                    self.setObjectNotExists('PLZ'+i.toString, {
                                                        type: 'state',
                                                        common: {  name: 'PLZ'+i.toString, type: 'string', role: 'indicator',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState('PLZ'+i.toString , {val: UserData.zipcode, ack: true});
                                                    // Strassenname für 
                                                    self.setObjectNotExists('Strasse'+i.toString, {
                                                        type: 'state',
                                                        common: {  name: 'PLZ'+i.toString, type: 'string', role: 'indicator',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState('Strasse'+i.toString , {val: UserData.street, ack: true});
                                                    // Strassenname für 
                                                    self.setObjectNotExists('Hausnummer'+i.toString, {
                                                        type: 'state',
                                                        common: {  name: 'Hausnummer'+i.toString, type: 'string', role: 'indicator',read: true, write: false,}, native: {},
                                                    });
                                                    self.setState('Hausnummer'+i.toString , {val: UserData.streetnumber, ack: true});
                                                }
                                                // Strassenname für 
                                                self.setObjectNotExists('JSONAdressen', {
                                                    type: 'state',
                                                    common: {  name: 'JSONAdressen', type: 'string', role: 'json',read: true, write: false,}, native: {},
                                                });
                                                self.setState('JSONAdressen'  , {val: content, ack: true});

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