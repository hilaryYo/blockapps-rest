import jwt from 'jsonwebtoken'
import simpleOauth from 'simple-oauth2'
import unixTime from 'unix-time'
import request from 'sync-request'
import getPem from 'rsa-pem-from-mod-exp'


class OAuthUtil {
	constructor(oauthConfig) {
		this.appTokenCookieName = oauthConfig.appTokenCookieName;
		this.appTokenExpirationCookieName = oauthConfig.appTokenCookieName + '_expiry';
		this.appTokenCookieMaxAge = oauthConfig.appTokenCookieMaxAge;
		this.refreshTokenCookieName = oauthConfig.appTokenCookieName + '_refresh';
		this.clientId = oauthConfig.clientId;
		this.clientSecret = oauthConfig.clientSecret;
		this.redirectUri = oauthConfig.redirectUri;
		this.openIdDiscoveryUrl = oauthConfig.openIdDiscoveryUrl;
		this.logoutRedirectUri = oauthConfig.logoutRedirectUri;
		this.scope = oauthConfig.scope || 'email openid';
		this.openIdConfig;
		this.jwtAlgorithm;
		this.issuer;
		this.logOutUrl;
		this.keys = [];
		this.tokenField = oauthConfig.tokenField ? oauthConfig.tokenField : 'access_token'; //could use id_token
	}

	/**
	 * This function calls openIdConfigUrl to get openIdConfig and it also fetches
	 * any public keys that maybe used to sign tokens
	 * @returns {()}
	 */
	getOpenIdConfig() {
		try {
			const response = request('GET', this.openIdDiscoveryUrl).getBody('utf8');
			this.openIdConfig = JSON.parse(response);
			this.jwtAlgorithm = this.openIdConfig.id_token_signing_alg_values_supported;
			this.issuer = this.openIdConfig.issuer;
			this.logOutUrl = this.openIdConfig.end_session_endpoint;
			
			if(this.openIdConfig.jwks_uri) {
				const keyResponse = request('GET', this.openIdConfig.jwks_uri).getBody('utf8');
				this.keys = JSON.parse(keyResponse).keys;
			}
			 
		}
		catch(error) {
			throw error
		}
	}

	/**
	 * This function creates a new instance of OauthUtil and populates the relevant fields
	 * @param oauthConfig
	 * @returns o an instance of the OAuthUtil
	 */
	static init(oauthConfig) {
		try {
			const o = new OAuthUtil(oauthConfig);
			o.getOpenIdConfig();
			// get tokenHost

			const url_split = o.openIdDiscoveryUrl.split('/');
			const tokenHost = url_split[0] + '//' + url_split[2];

			const credentials = {
			  client: {
			    id: o.clientId,
			    secret: o.clientSecret
			  },
			  auth: {
			    tokenHost: tokenHost,
			    tokenPath: o.openIdConfig.token_endpoint,
			    authorizePath: o.openIdConfig.authorization_endpoint
			  }
			};

			o.oauth2 = simpleOauth.create(credentials);

			return o;
		}
		catch(error) {
			throw error;
		}
	}

	/**
	 * This function gets the sign in url for oauth
	 * @method{getSigninURL}
	 * @returns AuthorizationUri
	 */
	getSigninURL() {
		const authorizationUri = this.oauth2.authorizationCode.authorizeURL({
	      redirect_uri: this.redirectUri,
	      scope: this.scope,
	      state: '',
	    });

	    return authorizationUri;
	}

	/**
	 * This function gets the access token from the authorization code
	 * @method{getAccessTokenByAuthCode}
	 * @param {String} authCode
	 * @returns AccessTokenResponse
	 */
	async getAccessTokenByAuthCode(authCode) {
		const tokenConfig = {
			code: authCode,
			redirect_uri: this.redirectUri,
			scope: this.scope,
		};

		const result = await this.oauth2.authorizationCode.getToken(tokenConfig);
		const accessTokenResponse = this.oauth2.accessToken.create(result);

		return accessTokenResponse;
	}

	/**
	 * This function gets the access token using the client secret
	 * @method{getAccessTokenByClientSecret}
	 * @returns AccessTokenResponse
	 */
	async getAccessTokenByClientSecret() {
		const tokenConfig = {
			scope: this.scope
		};

		const result = await this.oauth2.clientCredentials.getToken(tokenConfig);
		const accessTokenResponse = this.oauth2.accessToken.create(result);

		return accessTokenResponse;
	}

	
	/** Verify JWT signature - to verify the requests to middleware that are not forwarded to STRATO to be verified on it's side
	 * @todo To be fixed to work with all OpenID providers JWKs verification mechanisms. Currently only supports Azure, does not work with Keycloak (RS256 key can't be verified against the JWK cert provided in discovery)
	 * @method{isTokenValid}
	 * @param {String} accessToken
	 * @returns {Boolean}
	 */
	isTokenValid(accessToken) {
		const decoded = jwt.decode(accessToken, {complete: true});
		// FIX ME: Very azure specific
		switch(decoded.header.alg) {
			case 'RS256':
				const key = this.keys.find(k => k.kid == decoded.header.kid && k.x5t == decoded.header.x5t);
				try {
					let pemKey = ''
					// azure
					if(key.x5c) {
						pemKey = 	`-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`
					}
					// keycloak
					if(key.n && key.e) {
						pemKey = getPem(key.n, key.e)
					}
					const verified = jwt.verify(
						accessToken, 
						pemKey, 
						{ ignoreExpiration: false } 
					);
					return true;
				} catch(e) {
					console.log(e);
					return false;
				}
			case 'HS256':
				try {
					const verified = jwt.verify(accessToken, this.clientSecret, {ignoreExpiration: false} );
					return true;
				} catch(e) {
					return false;
				}
			default:
				return false;
		}
	}

	/**
	 * This functions validates token expiry without validating signature
	 * @method{isTokenExpired}
	 * @param {String} accessToken
	 * @param {Number} cookieExpiry
	 * @returns {Boolean} 
	 */
	isTokenExpired(accessToken, cookieExpiry) {
		if(cookieExpiry) {
			return cookieExpiry <= unixTime(new Date());
		}

		const decodedToken = jwt.decode(accessToken);
		const expiry = decodedToken['exp'];
		return expiry <= unixTime(new Date());
		// FIX ME: Evaluate time zone issues
	}

	/**
	 * Refresh an access token, given a token object
	 * @method{refreshToken}
	 * @param tokenObject
	 * @returns Token response with updated token
	 */
	async refreshToken(tokenObject) {
		const token = this.oauth2.accessToken.create(tokenObject);
		const tokenResponse = await token.refresh();
		return tokenResponse;
	}

	/**
	* Validate the express.js API request against the tokens validity, refresh access token seamlessly for user if needed
	* @param req
	* @param res
	* @returns {Promise<*>}
	*/
  async validateAndGetNewToken(req, res) {
    try {
      const accessToken = req['cookies'][this.appTokenCookieName] ? req['cookies'][this.appTokenCookieName] : null;
      if (!accessToken) throw 'Access Token not found';

      const refreshToken = req['cookies'][this.refreshTokenCookieName] ? req['cookies'][this.refreshTokenCookieName] : null;
      const expiryCookie = req['cookies'][this.appTokenExpirationCookieName] ? req['cookies'][this.appTokenExpirationCookieName] : null;

			const expired = this.isTokenExpired(accessToken, expiryCookie);
			
			if(!expired) {
				return;
			}
			
			if (!refreshToken) {
				res.clearCookie(this.appTokenCookieName);
        res.clearCookie(this.appTokenExpirationCookieName);
				throw 'Refresh Token not found';
      }

      const tokenObject = {
				'access_token': accessToken,
				'refresh_token': refreshToken
			};

			const tokenResponse = await this.refreshToken(tokenObject);
			// signature validation is done on STRATO node side by nginx
			const decoded = jwt.decode(tokenResponse.token[this.tokenField]);

			req['cookies'][this.appTokenCookieName] = tokenResponse.token[this.tokenField];
			req['cookies'][this.appTokenExpirationCookieName] = decoded['exp'];
			req['cookies'][this.refreshTokenCookieName] = tokenResponse.token['refresh_token'];
			res.cookie(this.appTokenCookieName, tokenResponse.token[this.tokenField], {
				maxAge: this.appTokenCookieMaxAge,
				httpOnly: true
			});
			res.cookie(this.appTokenExpirationCookieName, decoded['exp'], {
				maxAge: this.appTokenCookieMaxAge,
				httpOnly: true
			});
			res.cookie(this.refreshTokenCookieName, tokenResponse.token['refresh_token'], {
				maxAge: this.appTokenCookieMaxAge,
				httpOnly: true
			});

      return;

    } catch (error) {
      // FIXME: decide error model here
      throw error;
    }
  }

  /**
	 * This function constructs a logout url for oauth
	 * @method{getLogOutUrl}
	 * @returns(String) logout url
	 */
	getLogOutUrl() {
		return `${this.logOutUrl}?client_id=${this.clientId}&post_logout_redirect_uri=${this.logoutRedirectUri}`;
	}

  /**
	 * Get the name of the cookie storing access token
   * @returns(String) access token cookie name
   */
	getCookieNameAccessToken() {
		return this.appTokenCookieName;
	}

  /**
   * Get the name of the cookie storing access token expire date
   * @returns(String) access token expire date cookie name
   */
	getCookieNameAccessTokenExpiry() {
      return this.appTokenExpirationCookieName;
	}

  /**
   * Get the name of the cookie storing refresh token
   * @returns(String) refresh token cookie name
   */
	getCookieNameRefreshToken() {
      return this.refreshTokenCookieName;
	}
};

export default OAuthUtil