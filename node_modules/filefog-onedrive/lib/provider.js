var q = require('q')
    , OAuth = require('oauth');

var OAuth2 = OAuth.OAuth2;

var Provider = function(){
    var self = this;
    self._oauth2Client = new OAuth2(
        self.config.client_key,
        self.config.client_secret,
        '',
        'https://login.live.com/oauth20_authorize.srf',
        'https://login.live.com/oauth20_token.srf'
    );
};

Provider.prototype.oAuthGetAuthorizeUrl = function () {
    return this._oauth2Client.getAuthorizeUrl({
        "redirect_uri": this.config.redirect_url,
        "response_type": "code",
        "scope": this.config.client_scope

    })
}

Provider.prototype.oAuthGetAccessToken = function (code) {
    var deferred = q.defer();
    this._oauth2Client.getOAuthAccessToken(
        code,
        {
            "grant_type": "authorization_code",
            "redirect_uri": this.config.redirect_url
        },
        function (err, access_token, refresh_token, results) {
            if (err) return deferred.reject(err);
            results['access_token'] = access_token;
            results['refresh_token'] = refresh_token;
            return deferred.resolve(results);
        });
    return deferred.promise;
}

Provider.prototype.oAuthRefreshAccessToken = function (credentials){
    var deferred = q.defer();
    this._oauth2Client.getOAuthAccessToken(
        credentials.refresh_token,
        {
            "grant_type": "refresh_token"
        },
        function (err, access_token, refresh_token, results) {
            if (err) return deferred.reject(err);
            results['access_token'] = access_token;
            results['refresh_token'] = refresh_token || credentials.refresh_token;
            return deferred.resolve(results);
        });
    return deferred.promise;
}

module.exports = Provider;





