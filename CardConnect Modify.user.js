// ==UserScript==
// @name         CardConnect Modify
// @namespace    http://tampermonkey.net/
// @version      2024-01-12
// @description  Overrides CardConnect in Navigator to NO Beep and NO Confirm prompt.
// @author       Mystery Person
// @match       *://b2b.wmbird.com/dancik/om/app-mgr/order.jsp*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wmbird.com
// @grant        none
// ==/UserScript==

!function($, Promise) {
    $App.Module("CardConnect", {
        defaults: {
            baseUrl: "../../dancik-aws/"
        },
        initialize: function() {
            this.profileId = null, this.merchantId = null, this.authMerchantId = null, this.deviceSerial = null,
            this.session = {
                key: null,
                expires: null
            }, this.ajax = {}, this.disposer = function() {
                this.isConnected() && (this.disconnect(), this.cancel());
            }.bind(this);
        },
        getSessionKey: function() {
            return this.session.key;
        },
        getSessionExpiration: function() {
            return this.session.expires;
        },
        setMerchant: function(profileId, merchantId, authMerchantId) {
            this.profileId = profileId, this.merchantId = merchantId, authMerchantId && authMerchantId !== merchantId ? this.authMerchantId = authMerchantId : this.authMerchantId = null;
        },
        parseToken: function(token) {
            token = token ? $.trim(token) : "";
            var cardType, cardName, lastFour, reg = /^\d(.{1}).*(.{4})$/g, matches = reg.exec(token);
            if (matches) {
                switch (matches[1]) {
                  case "3":
                    cardType = "AMEX", cardName = "American Express";
                    break;

                  case "4":
                    cardType = "VISA", cardName = "Visa";
                    break;

                  case "2":
                  case "5":
                    cardType = "MC", cardName = "Mastercard";
                    break;

                  case "6":
                    cardType = "DISC", cardName = "Discover";
                    break;

                  default:
                    cardType = "ECHK", cardName = "ACH";
                }
                matches[2] && (lastFour = matches[2]);
            }
            return {
                cardType: cardType || "",
                cardName: cardName || "",
                lastFour: lastFour || ""
            };
        },
        isConnected: function() {
            if (!this.session.key || !this.deviceSerial) return !1;
            if (this.session.expires) {
                var now = new Date(), expires = new Date(this.session.expires);
                return expires > now;
            }
            return !0;
        },
        reset: function() {
            this.deviceSerial = null, this.session = {
                key: null,
                expires: null
            }, clearInterval(this.interval), $(window).off("beforeunload", this.disposer);
        },
        getAuthMerchant: function(data, options) {
            var api = "des/getPaymentHardware_MerchantId";
            return this._request(data, api, "POST", options).then(function(result) {
                result = result || {};
                var info = result.info || {};
                return {
                    authMerchantId: info.authmerchantid,
                    merchantId: info.merchantid
                };
            });
        },
        open: function(hsn, force, callback, token) {
            return Promise.using(this.connect(hsn, force, token).disposer(function(conn) {
                if (conn) return conn.disconnect();
            }), callback);
        },
        preconnect: function(hsn, options) {
            var api = "external/CardConnectBolt/preconnect";
            return this._request({
                merchantId: this.merchantId,
                hsn: hsn
            }, api, "POST", options);
        },
        connect: function(hsn, force, token, options) {
            var _this = this, api = "external/CardConnectBolt/connect";
            if ($(window).off("beforeunload", _this.disposer), this.isConnected()) throw new Error("Device already connected.");
            return this._request({
                merchantId: this.merchantId,
                hsn: hsn,
                force: force,
                token: token ? token : void 0
            }, api, "POST", options).then(function(res) {
                if (res = res || {}, res.session && res.session.key) return _this.deviceSerial = hsn,
                _this.session.key = res.session.key, _this.session.expires = res.session.expires || null,
                $(window).on("beforeunload", _this.disposer), _this;
                throw new Error("Session failed to initialize.");
            });
        },
        disconnect: function(options) {
            var _this = this;
            if (_this.isConnected()) return $.each(_this.ajax, function(api, req) {
                req.aborted = !0, req.abort(), delete _this.ajax[api];
            }), _this._request_bolt({
                merchantId: _this.merchantId,
                hsn: _this.deviceSerial
            }, "disconnect", options).then(function(res) {
                return _this.reset(), res;
            });
            throw _this.reset(), new Error("Device not connected.");
        },
        keepConnected: function(enabled, options) {
            var _this = this;
            if (clearInterval(this.interval), enabled) {
                if (!this.isConnected()) throw new Error("Device not connected.");
                this.interval = setInterval(function() {
                    _this._request_bolt({
                        merchantId: _this.merchantId,
                        hsn: _this.deviceSerial
                    }, "ping", options);
                }, 6e4);
            }
        },
        listTerminals: function(options) {
            return this._request_bolt({
                merchantId: this.merchantId
            }, "listTerminals", options);
        },
        getPanPadVersion: function(options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial
            }, "getPanPadVersion", options);
        },
        dateTime: function(dateTime, options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial,
                dateTime: dateTime
            }, "dateTime", options);
        },
        ping: function(options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial
            }, "ping", options);
        },
        cancel: function(options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial
            }, "cancel", options);
        },
        display: function(text, options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial,
                text: text
            }, "display", options);
        },
        confirm: function(prompt, options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial,
                prompt: prompt
            }, "readConfirmation", options);
        },
        readInput: function(prompt, format, options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial,
                prompt: prompt,
                format: format
            }, "readInput", options);
        },
        readSignature: function(prompt, options) {
            return this._request_bolt({
                merchantId: this.merchantId,
                hsn: this.deviceSerial,
                prompt: prompt
            }, "readSignature", options);
        },
        readCard: function(params, options) {
            return this._request_bolt($.extend({
                merchantId: this.merchantId,
                hsn: this.deviceSerial,
                beep: !0,
                includePIN: !1,
                includeSignature: !0,
                includeAmountDisplay: !0
            }, params), "readCard", options);
        },
        authCard: function(params, options) {
            return this._request_bolt($.extend({
                merchantId: this.merchantId,
                authMerchantId: this.authMerchantId || void 0,
                hsn: this.deviceSerial,
                beep: !1,
                capture: !0,
                includePIN: !1,
                includeAVS: !0,
                includeSignature: !0,
                includeAmountDisplay: !0,
                confirmAmount: !1
            }, params), "authCard", options);
        },
        readManual: function(params, options) {
            return this._request_bolt($.extend({
                merchantId: this.merchantId,
                hsn: this.deviceSerial,
                beep: !0,
                includeSignature: !0,
                includeExpirationDate: !0
            }, params), "readManual", options);
        },
        authManual: function(params, options) {
            return this._request_bolt($.extend({
                merchantId: this.merchantId,
                authMerchantId: this.authMerchantId || void 0,
                hsn: this.deviceSerial,
                beep: !0,
                capture: !0,
                includeSignature: !0,
                includeAmountDisplay: !0,
                includeAVS: !1,
                includeCVV: !1
            }, params), "authManual", options);
        },
        authorize: function(params, options) {
            var api = "external/CardConnectGateway/auth";
            return params.profile ? this._request($.extend({
                merchid: this.authMerchantId || this.merchantId,
                profile: "",
                amount: "",
                cofpermission: "",
                cof: "",
                cofscheduled: "",
                capture: "",
                ecomind: ""
            }, params), api, "PUT", options) : this._request($.extend({
                merchid: this.authMerchantId || this.merchantId,
                name: "",
                address: "",
                city: "",
                region: "",
                postal: "",
                account: "",
                amount: "",
                capture: "",
                ecomind: ""
            }, params), api, "PUT", options);
        },
        create_profile: function(params, options) {
            var api = "external/CardConnectGateway/createProfile";
            return this._request($.extend({
                merchid: this.authMerchantId || this.merchantId,
                name: "",
                address: "",
                city: "",
                region: "",
                postal: "",
                account: "",
                cofpermission: "",
                cof: ""
            }, params), api, "PUT", options);
        },
        delete_profile: function(params, options) {
            var api = "external/CardConnectGateway/deleteProfile";
            return this._request($.extend({
                merchid: this.authMerchantId || this.merchantId,
                acctid: "1",
                profileid: ""
            }, params), api, "DELETE", options);
        },
        voidTransaction: function(params, options) {
            var api = "external/CardConnectGateway/voidTransaction";
            return this._request($.extend({
                merchid: this.authMerchantId || this.merchantId,
                amount: "",
                retref: ""
            }, params), api, "PUT", options);
        },
        refund: function(params, options) {
            var api = "external/CardConnectGateway/refund";
            return this._request($.extend({
                merchid: this.authMerchantId || this.merchantId,
                amount: "",
                retref: ""
            }, params), api, "PUT", options);
        },
        inquire: function(params, options) {
            var api = "external/CardConnectGateway/inquire";
            return this._request($.extend({
                merchid: this.authMerchantId || this.merchantId,
                retref: ""
            }, params), api, "PUT", options);
        },
        _request_bolt: function(data, api, options) {
            var _this = this, url = this.defaults.baseUrl + "external/CardConnectBolt/" + api;
            return this.ajax[api] && (this.ajax[api].aborted = !0, this.ajax[api].abort()),
            this.ajax[api] = $.ajax($.extend(!0, {
                url: url,
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                type: "post",
                beforeSend: function(request) {
                    _this.profileId && request.setRequestHeader("X-KCS-PaymentProfileId", _this.profileId),
                    _this.session.key && request.setRequestHeader("X-CardConnect-SessionKey", _this.session.key);
                },
                complete: function() {
                    delete _this.ajax[api];
                }
            }, options)), Promise.resolve(this.ajax[api]).then(function(result) {
                if (result = result || {}, result.errors) {
                    var err = new Error("Error communicating with server.");
                    throw err.errors = result.errors, err;
                }
                return result.session && (result.session.key && (_this.session.key = result.session.key),
                result.session.expires && (_this.session.expires = result.session.expires)), result;
            }, function(xhr) {
                if (!xhr.aborted) {
                    var err = new Error("Error communicating with server.");
                    try {
                        var json = JSON.parse(xhr.responseText);
                        json.errors && (err.errors = json.errors);
                    } catch (ex) {
                        err.message = xhr.statusText || err.message;
                    }
                    throw err;
                }
            });
        },
        _request: function(data, api, method, options) {
            var _this = this, url = this.defaults.baseUrl + api;
            return this.ajax[api] && (this.ajax[api].aborted = !0, this.ajax[api].abort()),
            this.ajax[api] = $.ajax($.extend(!0, {
                url: url,
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                type: method || "post",
                beforeSend: function(request) {
                    _this.profileId && request.setRequestHeader("X-KCS-PaymentProfileId", _this.profileId);
                },
                complete: function() {
                    delete _this.ajax[api];
                }
            }, options)), Promise.resolve(this.ajax[api]).then(function(result) {
                if (result = result || {}, result.errors) {
                    var err = new Error("Error communicating with server.");
                    throw err.errors = result.errors, err;
                }
                return result;
            }, function(xhr) {
                if (!xhr.aborted) {
                    var err = new Error("Error communicating with server.");
                    try {
                        var json = JSON.parse(xhr.responseText);
                        json.errors && (err.errors = json.errors);
                    } catch (ex) {
                        err.message = xhr.statusText || err.message;
                    }
                    throw err;
                }
            });
        }
    });
}(jQuery, Promise)
