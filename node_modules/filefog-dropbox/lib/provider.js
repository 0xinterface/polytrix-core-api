var q = require('q')
    , OAuth = require('oauth');

//My God Dropbox.js butchers OAuth2 flow. Using node-oauth to do the intial transfer.
var OAuth2 = OAuth.OAuth2;

var Provider = function(){
    this._oauth2Client = new OAuth2(
        this.config.client_key,
        this.config.client_secret,
        '',
        'https://www.dropbox.com/1/oauth2/authorize',
        'https://api.dropbox.com/1/oauth2/token'
    );
};

Provider.prototype.oAuthGetAuthorizeUrl = function oAuthGetAuthorizeUrl() {
    return this._oauth2Client.getAuthorizeUrl({
        "redirect_uri": this.config.redirect_url,
        "response_type": "code"
    })
}

Provider.prototype.oAuthGetAccessToken = function oAuthGetAccessToken(code) {
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

Provider.prototype.oAuthRefreshAccessToken = function oAuthRefreshAccessToken(credentials){
    //dropbox access tokens do not need to be refreshed
    return (credentials._raw ? q(credentials._raw) : q(credentials));
}

module.exports = Provider;






