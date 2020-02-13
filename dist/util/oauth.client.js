"use strict";var _commander=_interopRequireDefault(require("commander")),_fs=_interopRequireDefault(require("fs")),_fsUtil=_interopRequireDefault(require("./fsUtil")),_oauth=_interopRequireDefault(require("./oauth.util")),_tcpPortUsed=_interopRequireDefault(require("tcp-port-used")),_http=_interopRequireDefault(require("http")),_https=_interopRequireDefault(require("https")),_queryString=_interopRequireDefault(require("query-string")),_url=_interopRequireDefault(require("url"));function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function asyncGeneratorStep(e,n,t,o,r,s,i){try{var a=e[s](i),c=a.value}catch(e){return void t(e)}a.done?n(c):Promise.resolve(c).then(o,r)}function _asyncToGenerator(a){return function(){var e=this,i=arguments;return new Promise(function(n,t){var o=a.apply(e,i);function r(e){asyncGeneratorStep(o,n,t,r,s,"next",e)}function s(e){asyncGeneratorStep(o,n,t,r,s,"throw",e)}r(void 0)})}}var _require=require("flatted/cjs"),stringify=_require.stringify,envPath=".env",envfile=require("envfile"),envConfig={},DUMMY_SSL_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDBVqh671M27QJW\nekIc/QkKnF9I3rM7/XXyvFlYAAscRRNs9TpxTGW8n/KnBMeKFdPwj19YLMk43tf4\nvhMBfCWQP2dXa7TwhXYClmpKXAllWDdyKAfVmH3ccErDAyab/ZDdyhleR65eLqbB\nvc5Gf/bIksS7YtV4dmP1wd0SOrmoKFS+t4gcR6+NVWsHaeqx3avS7VJedgNPVKjb\n97sbHA/PTzTEOgZlHEtIIz+e1ESCPNMdr2DN04KC+3ivx24kk4IsXJHD+8m7IImx\nT4q+mf9j6EZtbj9CA2BaSHLx+h8EOq4I2RIMSDYjU8R7Xk1QrVdkpS0t9TxPjWRy\niuu9LF9tAgMBAAECggEAWliFeJUXnMYaXpDZDjTMIdI60JGIzhK+KEUNtwqmJnq8\n/iCGQ+WAcSmJObUJDaTvmi1VT532FgZEhC9GMF50KzkFsJtbPT4QjFr/pmnl1h7o\nIgdEyfJtdjJfLUvuodxW8t17B0yV1dsU/9oTZ2xqxQWYuzwPJzCju3bxOJCKq2ID\n71Xl32yQALwsCNyb74RvMSJgk28PGqjU+zhQp7Nw2xoy/Oz+i9nZkH1YPZipkX1S\n0jtj2z5XVsW+MFgPnMuy8Ut3Rn/zAWSi/PpSh1e4qPLMlmc7a7OFpbEpCmceAlnj\nzmqo+U5Ns9MF5gWdspKC9qD8ZqKES2jWCPCrrjXBHQKBgQD7AVj55xVej0mI2FOw\nxehBwSd56Xm0potvsdHNe1Nb6DPU9OoriA/6Gp0sA+EA/8AKo+41uHEW7BZXtHGN\nZCphn4V8CqhMNtoACWdrfSwocJmoxzQt2/PDlyPSUTozxPnzwmOXP9bCatcUiNYq\nlyb4EH9dNXsPDK02xPz+Ooj/AwKBgQDFL4yBEqT3pZz3qrBN7rsWHQckPAu9/2Vk\nf4sImV8nsIvL0VoKdB7N3E6BycVWRDZhJKGYTKDvCWG5CNvIuFuwEawsIpuxVRlr\nhjVQno5/u8PMecydQbleJE/Ud4VXuojw+aR4xIILgXGygUKywHpdNnCI7dhV0hNm\nWMLlDUNkzwKBgG4mcT15w07z4nlDNbblor74XLKLWvWEALzLdB6QeExk4hoaQIlJ\n9Hj1JPQj36HomgYRWoAIqNg+Uq+6Z/p8cnzU3GdK5gBMMe7CMbhh/fbhMw12Hdfi\nJl82/GlXbAs77dSjAcFmKoC3EhvY0ONv4ZIK61mkFpTMI1ddqwiF94ixAoGAflK8\n33+TQbfOfHfUJMkY/8yu4464Mwsn6J8w8dxXsnSOyo8e8O19QoKtpMYfbumaMNen\n0orc2uYWvdSoAMniq0RXGZs+RPfwpgq/oxtAzSH8CMXKyL/vQhlfLw021oIA8ufr\nbxbs/PP7Y9EdaqiWe5rBs2c0HZ7MoNeiW90IXM8CgYEA5ZEjdlwDsDANNb4MocbI\npOkAY1bR1oTsNnEC3nNX+rMKOWT2NLBNSS1kS+6M68Ctky1XFOqgtRZZCG8PY7ou\ngB1T/TRMjqnNJWOvycD4uIUwIdp0NmGboRqdGphbJinMmXfg8PcC/QM2fncG8SCK\niHm1aYKK8r/QobR/qJsWtuI=\n-----END PRIVATE KEY-----",DUMMY_SSL_CERT="-----BEGIN CERTIFICATE-----\nMIIDojCCAooCCQDFBdwwu1NhADANBgkqhkiG9w0BAQsFADCBkjELMAkGA1UEBhMC\nVVMxETAPBgNVBAgMCE5ldyBZb3JrMREwDwYDVQQHDAhCcm9va2x5bjEXMBUGA1UE\nCgwOQmxvY2tBcHBzIEluYy4xHjAcBgNVBAMMFXRlc3RuZXQuYmxvY2thcHBzLm5l\ndDEkMCIGCSqGSIb3DQEJARYVc3VwcG9ydEBibG9ja2FwcHMubmV0MB4XDTE4MDIx\nMzIwNTQxNVoXDTIxMDIxMjIwNTQxNVowgZIxCzAJBgNVBAYTAlVTMREwDwYDVQQI\nDAhOZXcgWW9yazERMA8GA1UEBwwIQnJvb2tseW4xFzAVBgNVBAoMDkJsb2NrQXBw\ncyBJbmMuMR4wHAYDVQQDDBV0ZXN0bmV0LmJsb2NrYXBwcy5uZXQxJDAiBgkqhkiG\n9w0BCQEWFXN1cHBvcnRAYmxvY2thcHBzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBAMFWqHrvUzbtAlZ6Qhz9CQqcX0jeszv9dfK8WVgACxxFE2z1\nOnFMZbyf8qcEx4oV0/CPX1gsyTje1/i+EwF8JZA/Z1drtPCFdgKWakpcCWVYN3Io\nB9WYfdxwSsMDJpv9kN3KGV5Hrl4upsG9zkZ/9siSxLti1Xh2Y/XB3RI6uagoVL63\niBxHr41Vawdp6rHdq9LtUl52A09UqNv3uxscD89PNMQ6BmUcS0gjP57URII80x2v\nYM3TgoL7eK/HbiSTgixckcP7ybsgibFPir6Z/2PoRm1uP0IDYFpIcvH6HwQ6rgjZ\nEgxINiNTxHteTVCtV2SlLS31PE+NZHKK670sX20CAwEAATANBgkqhkiG9w0BAQsF\nAAOCAQEATafWoYdQmUxiIsXitgHMV51f15KOWS6vsa+XfKPLFRFIbw8bYl/PdbJp\nXoxywIf9rz7/+Hme6JXhIIao26ahXWG34J06CJ3kvnQcFzrUJ4AZLZrs3E0yzsNK\n4zgdiPRK3TVCwzqnA6OkajLPuhisheAtoB2T5pR+SeC064cB3lhSgnFS31ePGmgv\nb4qiXqr2JW4Db8yW0eKYrfwhf9WoElVlgO1ogqZS+ygeKYFfoNhQ5wQ+c43jDK5G\nEDxFZuwghztIpmp2ItFOIxpsiZnEVlHNsq4H6YcZg4XENKhb9/lgIFiYADDbAEcq\npBMYLinJZN+jM/Xddr18fL0obdkk5Q==\n-----END CERTIFICATE-----";_fs.default.existsSync(envPath)||_fs.default.appendFileSync(envPath,"",function(e){if(e)throw e;console.log(".env file is created successfully.")}),envConfig=envfile.parseFileSync(envPath);var flows={authorizationCode:"authorization-code",clientCredential:"client-credential",resourceOwnerPasswordCredential:"resource-owner-password-credential"};_commander.default.option("-c, --config [path]","Config file","config.yaml").option("-f, --flow [oauth-flow]",'The oauth flow to user. Valid options are "'.concat(flows.clientCredential,'" (default) or "').concat(flows.authorizationCode,'" or "').concat(flows.resourceOwnerPasswordCredential,'"'),"client-credential").option("-e, --env [tokenName]","Create a .env file to include the specified token",null).option("-u, --username [username]","Username or client-id depending on the flow (optional)",null).option("-p, --password [password]","Password or client-secret depending on the flow (optional)",null).parse(process.argv),_fs.default.existsSync(_commander.default.config)||(console.error('Could not open config file at location "'.concat(_commander.default.config,'". You may need to specify --config option')),process.exit(1));var redirectUriParsed,portNumber,config=_fsUtil.default.getYaml(_commander.default.config);try{redirectUriParsed=_url.default.parse(config.nodes[0].oauth.redirectUri)}catch(e){console.error("Unable to parse redirectUri as the url",e),process.exit(10)}portNumber=redirectUriParsed.port?parseInt(redirectUriParsed.port):"https:"===redirectUriParsed.protocol?443:80,config&&Array.isArray(config.nodes)&&0!==config.nodes.length&&void 0!==config.nodes[0].oauth||(console.error("Invalid config"),process.exit(3));var run=function(){var e=_asyncToGenerator(regeneratorRuntime.mark(function e(){var c,l,n,t,o,r,s,i,a,d;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=function(){return(t=_asyncToGenerator(regeneratorRuntime.mark(function e(n,t){var o,r,s,i,a;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if("/"===n.url)return t.writeHead(302,{Location:l}),t.end(),e.abrupt("return");e.next=4;break;case 4:if(o=redirectUriParsed.pathname,0!==n.url.indexOf(o))return"/favicon.ico"!==n.url&&console.log("Unknown URI was called: "+n.url),t.writeHead(404),t.end(),e.abrupt("return");e.next=10;break;case 10:if((r=n.url.split("?")).length<2)return console.error("Missing query string in redirectUri callback url."),e.abrupt("return");e.next=14;break;case 14:if(void 0===(s=_queryString.default.parse(r[1])).code)return console.error('Missing required query parameter "code" in redirectUri callback'),e.abrupt("return");e.next=18;break;case 18:return e.next=20,c.getAccessTokenByAuthCode(s.code);case 20:i=e.sent,_commander.default.env&&(envConfig[_commander.default.env]=i.token.access_token,a=envfile.stringifySync(envConfig),_fs.default.writeFileSync(envPath,a),console.log(".env file was saved!")),console.log("Token obtained by authorization code flow is:"),console.log(stringify(i,null,2)),t.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),t.write('\n      <html>\n        <head>\n          <title>\n            BlockApps Token Exchange Utility\n          </title>\n          <meta name="google" content="notranslate">\n          <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"><\/script>\n          <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"><\/script>\n          <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"><\/script>\n          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">\n          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">\n          <style>\n            pre {\n              white-space: pre-wrap;       /* Since CSS 2.1 */\n              white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */\n              white-space: -pre-wrap;      /* Opera 4-6 */\n              white-space: -o-pre-wrap;    /* Opera 7 */\n              word-wrap: break-word;       /* Internet Explorer 5.5+ */\n              background-color: #e7e7e7;\n              padding-left: 24px;\n              padding-right: 24px;\n              border-radius: 4px;\n            }\n            body {\n              padding: 24px;\n            }\n            .padButton {\n              padding-bottom: 12px;\n            }\n            textarea {\n              border: none;\n              color: #fff;\n            }\n          </style>\n          <script>\n            function copyToClipboard(text) {\n              var textArea = document.createElement("textarea");\n              textArea.value = text;\n              document.body.appendChild(textArea);\n              textArea.focus();\n              textArea.select();\n              document.execCommand(\'copy\')\n              document.body.removeChild(textArea);\n            }\n            function logout(){\n              window.location=\''.concat(c.logOutUrl,"?redirect_uri=").concat(config.nodes[0].oauth.logoutRedirectUri,'/\'\n            }\n          <\/script>\n        </head>\n        <body>\n          <div class="container">\n            <div class="row">\n              <div class="offset-sm-10 col-sm-1 text-right padButton">\n                  <button onclick="logout()" class="btn btn-outline-dark btn-sm"> Logout </button>\n              </div>\n            </div>\n            <div class="row">\n              <div class="offset-sm-1 col-sm-9">\n                <h4>\n                  <small class="text-muted">Access Token</small>\n                </h4>\n              </div>\n              <div class="col-sm-1 text-right">\n                <button onclick="copyToClipboard(\'').concat(i.token.access_token,'\');" title="Copy to clipboard" class="btn btn-outline-dark btn-sm">\n                  <i class="fas fa-clipboard"></i>\n                </button>\n              </div>\n            </div>\n            <div class="row">\n              <div class="offset-sm-1 col-sm-10">\n                <pre>\n                  <code>\n                    ').concat(i.token.access_token,'\n                  </code>\n                </pre>\n              </div>\n            </div>\n            <div class="row">\n              <div class="offset-sm-1 col-sm-9">\n                <h4>\n                  <small class="text-muted">ID Token</small>\n                </h4>\n              </div>\n              <div class="col-sm-1 text-right">\n                <button onclick="copyToClipboard(\'').concat(i.token.id_token,'\');" title="Copy to clipboard" class="btn btn-outline-dark btn-sm">\n                  <i class="fas fa-clipboard"></i>\n                </button>\n              </div>\n            </div>\n            <div class="row">\n              <div class="offset-sm-1 col-sm-10">\n                <pre>\n                  <code>\n                    ').concat(i.token.id_token,"\n                  </code>\n                </pre>\n              </div>\n            </div>\n          </div>\n        </body>\n      </html>\n    ")),t.end();case 27:case"end":return e.stop()}},e)}))).apply(this,arguments)},n=function(e,n){return t.apply(this,arguments)},e.next=4,_tcpPortUsed.default.check(portNumber);case 4:e.sent&&(console.error("Port ".concat(portNumber," is in use.")),process.exit(4)),c=_oauth.default.init(config.nodes[0].oauth),l=c.getSigninURL(),e.t0=_commander.default.flow,e.next=e.t0===flows.clientCredential?11:e.t0===flows.resourceOwnerPasswordCredential?32:e.t0===flows.authorizationCode?48:52;break;case 11:if(void 0!==config.nodes[0].oauth.clientId&&void 0!==config.nodes[0].oauth.clientSecret||(console.error("Client id and client secret must be defined in config to use ".concat(flows.clientCredential," flow")),process.exit(5)),e.prev=12,_commander.default.username&&_commander.default.password)return e.next=16,c.getAccessTokenByClientSecret(_commander.default.username,_commander.default.password);e.next=19;break;case 16:o=e.sent,e.next=22;break;case 19:return e.next=21,c.getAccessTokenByClientSecret();case 21:o=e.sent;case 22:_commander.default.env&&(envConfig[_commander.default.env]=o.token.access_token,r=envfile.stringifySync(envConfig),_fs.default.writeFileSync(envPath,r),console.log(".env file was saved!")),console.log("Token obtained by ".concat(_commander.default.flow," flow is:")),console.log(stringify(o,null,2)),e.next=31;break;case 27:e.prev=27,e.t1=e.catch(12),console.log(e.t1),process.exit(8);case 31:return e.abrupt("break",52);case 32:return void 0!==config.nodes[0].oauth.clientId&&void 0!==config.nodes[0].oauth.clientSecret||(console.error("Client id and client secret must be defined in config to use ".concat(flows.resourceOwnerPasswordCredential," flow")),process.exit(6)),(config.nodes[0].oauth.serviceUsername||_commander.default.username)&&(config.nodes[0].oauth.servicePassword||_commander.default.password)||(console.error("Username and password must be defined in config or provided as an argument to use ".concat(flows.resourceOwnerPasswordCredential," flow")),process.exit(7)),e.prev=34,e.next=37,c.getAccessTokenByResourceOwnerCredential(_commander.default.username,_commander.default.password);case 37:s=e.sent,_commander.default.env&&(envConfig[_commander.default.env]=s.token.access_token,i=envfile.stringifySync(envConfig),_fs.default.writeFileSync(envPath,i),console.log(".env file was saved!")),console.log("Token obtained by ".concat(_commander.default.flow," flow is:")),console.log(stringify(s,null,2)),e.next=47;break;case 43:e.prev=43,e.t2=e.catch(34),console.log(e.t2),process.exit(9);case 47:return e.abrupt("break",52);case 48:return 443==portNumber?(a={key:DUMMY_SSL_KEY,cert:DUMMY_SSL_CERT},_https.default.createServer(a,n).listen(portNumber)):_http.default.createServer(n).listen(portNumber),d="".concat(redirectUriParsed.protocol,"//").concat(redirectUriParsed.host),console.log("Open sign-in URL in your browser to sign-in with OAuth and fetch token: ".concat(d)),e.abrupt("break",52);case 52:case"end":return e.stop()}},e,null,[[12,27],[34,43]])}));return function(){return e.apply(this,arguments)}}();try{run()}catch(e){console.error(e.message),process.exit(99)}
//# sourceMappingURL=oauth.client.js.map
