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
         

        this.log.debug('remote request started');

                request(
                    {
                        url: 'https://www.myjudo.eu/interface/?group=register&command=login&name=login&user=Willi1974&password=2edb3ccd0646f33644988ffa52a04b0d&nohash=Service&role=customer' ,
                         
                        json: true,
                        time: true,
                        timeout: 4500
                    },
                    (error, response, content) => {
                        self.log.debug('remote request done');
                        if (response) {
                            self.log.debug('received data (' + response.statusCode + '): ' + JSON.stringify(content));
                            if (!error && response.statusCode == 200) {
                                var TokenFrommyjudo =  content.token;
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
                                self.setState('ISoftSafe.Token' , {val: TokenFrommyjudo, ack: true});
                            }
                        }

       
                    }
                )
                
        
   

        // examples for the checkPassword/checkGroup functions
        let result = await this.checkPasswordAsync('admin', 'iobroker');
        this.log.info('check user admin pw iobroker: ' + result);

        result = await this.checkGroupAsync('admin', 'admin');
        this.log.info('check group user admin group admin: ' + result);
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