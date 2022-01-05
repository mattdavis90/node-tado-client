const expect = require('chai').expect;
const nock = require('nock');

const Tado = require('../index');
const auth_response = require('./response.auth');
const me_response = require('./response.me');
const home_response = require('./response.home');
const weather_response = require('./response.weather');
const devices_response = require('./response.devices');
const devices_offset_response = require('./response.devices.offset');
const installations_response = require('./response.installations');
const users_response = require('./response.users');
const mobileDevices_response = require('./response.mobileDevices');
const mobileDevice_response = require('./response.mobileDevice');
const mobileDevice_settings_response = require('./response.mobileDevice.settings');
const state_response = require('./response.state');
const zones_response = require('./response.zones');
const zone_state_response = require('./response.zone.state');
const zone_capabilities_response = require('./response.zone.capabilities');
const timetables_response = require('./response.timetables');
const away_configuration_response = require('./response.away');
const timetable_response = require('./response.timetable');
const zone_overlay_response = require('./response.zone.overlay');
const eneryIQ_response = require('./response.eneryIQ');
const eneryIQ_tariff_response = require('./response.eneryIQ.tariff');
const eneryIQ_meter_readings_response = require('./response.eneryIQ.meterReadings');
const eneryIQ_savings_response = require('./response.eneryIQ.savings');

describe('OAuth2 tests', () => {
    it('Should login', (done) => {
        nock('https://auth.tado.com')
            .post('/oauth/token')
            .reply(200, auth_response);

        var tado = new Tado();

        tado.login('username', 'password')
            .then(() => {
                expect(typeof tado._accessToken).to.equal('object');

                expect(tado._accessToken.token.access_token).to.equal('eyJraW0UQ')
                expect(tado._accessToken.token.token_type).to.equal('bearer')

                done();
            });
    });

    it('Should fail to login', (done) => {
        nock('https://auth.tado.com')
            .post('/oauth/token')
            .reply(500, {});

        var tado = new Tado();

        tado.login('username', 'password')
            .catch(error => {
                done();
            });
    });

    it('Should login then refresh token', (done) => {
        nock('https://auth.tado.com')
            .post('/oauth/token')
            .reply(200, auth_response);

        var tado = new Tado();

        tado.login('username', 'password')
            .then(response => {
                nock('https://auth.tado.com')
                    .post('/oauth/token')
                    .reply(200, auth_response);

                // Force a refresh
                tado._accessToken.token.expires_at = new Date();
                tado._refreshToken().then(res => {
                    done();
                });
            });
    });
});

describe('Low-level API tests', () => {
    it('Login and get "me"', (done) => {
        var tado = new Tado();

        nock('https://auth.tado.com')
            .post('/oauth/token')
            .reply(200, auth_response);
        nock('https://my.tado.com')
            .get('/api/v2/me')
            .reply(200, me_response);

        tado.login('username', 'password')
            .then(response => {
                tado.apiCall('/api/v2/me')
                    .then(response => {
                        expect(typeof response).to.equal('object');
                        expect(response.name).to.equal('John Doe');

                        done();
                    });
            });
    });

    it('Don\'t login and get "me"', (done) => {
        var tado = new Tado();

        tado.apiCall('/api/v2/me')
            .catch(error => {
                done();
            })
    });

    it('Login and fail to get "me"', (done) => {
        var tado = new Tado();

        nock('https://auth.tado.com')
            .post('/oauth/token')
            .reply(200, auth_response);
        nock('https://my.tado.com')
            .get('/api/v2/me')
            .reply(500, {});

        tado.login('username', 'password')
            .then(response => {
                tado.apiCall('/api/v2/me')
                    .catch(error => {
                        done();
                    });
            });
    });
});

describe('High-level API tests', () => {
    var tado;

    beforeEach((ready) => {
        tado = new Tado();

        nock('https://auth.tado.com')
            .post('/oauth/token')
            .reply(200, auth_response);

        tado.login('username', 'password').then(res => {
            ready();
        });
    });

    it('Should get the current user', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/me')
            .reply(200, me_response);

        tado.getMe()
            .then(response => {
                expect(typeof response).to.equal('object');

                expect(response.name).to.equal('John Doe');

                done();
            })
            .catch(err => {});
    });

    it('Should get home', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907')
            .reply(200, home_response);

        tado.getHome(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                expect(response.length).to.equal(1);
                expect(response[0].devices.length).to.equal(1);
                expect(response[0].devices[0].shortSerialNo).to.equal('RU04932458');

                done();
            })
            .catch(err => {});
    });

    it('Should get the weather', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/weather')
            .reply(200, weather_response);

        tado.getWeather(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                expect(response.weatherState.value).to.equal('DRIZZLE');

                done();
            })
            .catch(err => {});
    });

    it('Should get the devices', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/devices')
            .reply(200, devices_response);

        tado.getDevices(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                expect(response.length).to.equal(1);
                expect(response[0].shortSerialNo).to.equal('RU04932458');

                done();
            })
            .catch(err => {});
    });

    it('Should get the device temperature offset', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/devices/RU04932458/temperatureOffset')
            .reply(200, devices_offset_response);

        tado.getDeviceTemperatureOffset('RU04932458')
            .then(response => {
                expect(typeof response).to.equal('object');

                expect(response.celsius).to.equal(0.2);
                expect(response.farenheit).to.equal(0.2);

                done();
            })
            .catch(err => {console.log(err);});
    });

    it('Should get the installations', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/installations')
            .reply(200, installations_response);

        tado.getInstallations(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                expect(response.length).to.equal(1);
                expect(response[0].devices.length).to.equal(1);
                expect(response[0].devices[0].shortSerialNo).to.equal('RU04932458');

                done();
            })
            .catch(err => {});
    });

    it('Should get the users', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/users')
            .reply(200, users_response);

        tado.getUsers(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                expect(response.length).to.equal(1);
                expect(response[0].name).to.equal('John Doe');

                done();
            })
            .catch(err => {});
    });

    it('should get the home state', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/state')
            .reply(200, state_response);

        tado.getState(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get the mobile devices', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/mobileDevices')
            .reply(200, mobileDevices_response);

        tado.getMobileDevices(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get a mobile device', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/mobileDevices/644583')
            .reply(200, mobileDevice_response);

        tado.getMobileDevice(1907, 644583)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get a mobile device settings', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/mobileDevices/644583/settings')
            .reply(200, mobileDevice_settings_response);

        tado.getMobileDeviceSettings(1907, 644583)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get zones', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones')
            .reply(200, zones_response);

        tado.getZones(1907)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get a zone\'s state', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/state')
            .reply(200, zone_state_response);

        tado.getZoneState(1907, 1)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get a zone\'s capabilities', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/capabilities')
            .reply(200, zone_capabilities_response);

        tado.getZoneCapabilities(1907, 1)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get a zone\'s overlay', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/overlay')
            .reply(200, zone_overlay_response);

        tado.getZoneOverlay(1907, 1)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('should get a zone\'s timetables', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/schedule/activeTimetable')
            .reply(200, timetables_response);

        tado.getTimeTables(1907, 1)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('should get a zone\'s away configuration', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/awayConfiguration')
            .reply(200, away_configuration_response);

        tado.getAwayConfiguration(1907, 1)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('should get a timetable', (done) => {
        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/schedule/timetables/0/blocks')
            .reply(200, timetable_response);

        tado.getTimeTable(1907, 1, 0)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should clear a zone\'s overlay', (done) => {
        nock('https://my.tado.com')
            .delete('/api/v2/homes/1907/zones/1/overlay')
            .reply(200, {});

        tado.clearZoneOverlay(1907, 1)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should set a zone\'s overlay to Off', (done) => {
        nock('https://my.tado.com')
            .put('/api/v2/homes/1907/zones/1/overlay')
            .reply(200, (uri, req) => {
                return req;
            });

        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/state')
            .reply(200, zone_state_response);

        tado.setZoneOverlay(1907, 1, 'off')
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should set a zone\'s overlay to On with no temperature', (done) => {
        nock('https://my.tado.com')
            .put('/api/v2/homes/1907/zones/1/overlay')
            .reply(200, (uri, req) => {
                return req;
            });

        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/state')
            .reply(200, zone_state_response);

        tado.setZoneOverlay(1907, 1, 'on')
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should set a zone\'s overlay to On with Timer resume', (done) => {
        nock('https://my.tado.com')
            .put('/api/v2/homes/1907/zones/1/overlay')
            .reply(200, (uri, req) => {
                return req;
            });

        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/state')
            .reply(200, zone_state_response);

        tado.setZoneOverlay(1907, 1, 'on', 20, 300)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should set a zone\'s overlay to On with Auto resume', (done) => {
        nock('https://my.tado.com')
            .put('/api/v2/homes/1907/zones/1/overlay')
            .reply(200, (uri, req) => {
                return req;
            });

        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/state')
            .reply(200, zone_state_response);

        tado.setZoneOverlay(1907, 1, 'on', 20, 'auto')
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should set a zone\'s overlay to On until next time block ', (done) => {
        nock('https://my.tado.com')
            .put('/api/v2/homes/1907/zones/1/overlay')
            .reply(200, (uri, req) => {
                return req;
            });

        nock('https://my.tado.com')
            .get('/api/v2/homes/1907/zones/1/state')
            .reply(200, zone_state_response);

        tado.setZoneOverlay(1907, 1, 'on', 20, 'next_time_block')
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should set a device\'s temperature offset', (done) => {
        nock('https://my.tado.com')
            .put('/api/v2/devices/RU04932458/temperatureOffset')
            .reply(200, (uri, req) => {
                return req;
            });

        tado.setDeviceTemperatureOffset('RU04932458', 0.2)
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get identify a device', (done) => {
        nock('https://my.tado.com')
            .post('/api/v2/devices/RU04932458/identify')
            .reply(200, {});

        tado.identifyDevice('RU04932458')
            .then(response => {
                expect(typeof response).to.equal('object');

                done();
            })
            .catch(err => {});
    });

    it('Should get energyIQ', (done) => {
        nock('https://energy-insights.tado.com')
            .get('/api/homes/1907/consumption')
            .reply(200, eneryIQ_response);


        tado.getEnergyIQ('1907')
            .then(response => {
                expect(typeof response).to.equal('object');
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            });
    });

    it('Should get energyIQ Tariff', (done) => {
        nock('https://energy-insights.tado.com')
            .get('/api/homes/1907/tariff')
            .reply(200, eneryIQ_tariff_response);


        tado.getEnergyIQtariff('1907')
            .then(response => {
                expect(typeof response).to.equal('object');
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            });
    });

    it('Should update energyIQ Tariff', (done) => {

        nock('https://energy-insights.tado.com')
            .put('/api/homes/1907/tariff')
            .reply(200, (uri, req) => {
                return req;
            })

        tado.updateEnergyIQtariff('1907', 'm3',303)
            .then(response => {
                expect(typeof response).to.equal('object');
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            });
    });

    it('Should get energyIQ meter readings', (done) => {
        nock('https://energy-insights.tado.com')
            .get('/api/homes/1907/meterReadings')
            .reply(200, eneryIQ_meter_readings_response);

        tado.getEnergyIQMeterReadings('1907')
            .then(response => {
                expect(typeof response).to.equal('object');
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            });
    });

    it('Should add energyIQ meter readings', (done) => {
        nock('https://energy-insights.tado.com')
            .post('/api/homes/1907/meterReadings')
            .reply(200, (uri, req) => {
                return req;
            })

        tado.addEnergyIQMeterReading('1907','2022-01-05',6813)
            .then(response => {
                expect(typeof response).to.equal('object');
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            });
    });

    it('Should get energyIQ savings', (done) => {
        nock('https://energy-bob.tado.com')
            .get('/1907/2021-11?country=NLD')
            .reply(200, eneryIQ_savings_response);

        tado.getEnergySavingsReport('1907', 2021, 11, 'NLD')
            .then(response => {
                expect(typeof response).to.equal('object');
                done();
            })
            .catch(err => {
                console.log(err);
                done();
            });
    });


});
