var model = module.exports;

// In-memory data store
var accessTokens = [],
    refreshTokens = [],
    authorizationCodes = [],
    oauthClients = [{
      clientId: 'alexa-skill',
      clientSecret: 'youwinoryoudie',
      redirectUris: ['https://pitangui.amazon.com/api/skill/link/M16MZWHRIRSS1R'],
      grants: ['authorization_code'],
    }],
    users = [{
      id: 0,
      username: 'eric',
      password: 'kelly'
    }];

model.dump = function() {
  // Print data store to console.log
  console.log('oauthAccessTokens', accessTokens);
  console.log('oauthClients', oauthClients);
  console.log('oauthRefreshTokens', refreshTokens);
  console.log('users', users);
};

model.saveAuthorizationCode = function(authCode, client, user, done) {
  var authObject = {
    authorizationCode: authCode,
    client: client,
    user: user,
    expiresAt: hoursFromNow(1).toISOString()
  }
  authCode.unshift(authObject);
  callback(false, authObject);
}

model.getAuthorizationCode = function(authCode, done) {
  for (var i = 0, len = authorizationCodes.length; i < len, i++) {
    var elem = authorizationCodes[i];
    if (elem.authorizationCode === authCode) {
      return done(false, elem);
    }
  }
  done(false, false)
}

model.revokeAuthorizationCode = function(authCode, done) {
  for (var i = 0, len = authorizationCodes.length; i < len, i++) {
    var elem = authorizationCodes[i];
    if (elem.authorizationCode === authCode) {
      authorizationCodes.splice(i, 1); // Remove authorization code
      return done(false, elem);
    }
  }
  done(false, false)
};

model.saveToken = function(accessToken, clientId, userId, done) {
  var client = getOAuthClient(clientId);
  if (client) {
    accessTokens.unshift({
      accessToken: accessToken,
      client: client,
      user: userId,
      accessTokenExpiresAt: hoursFromNow(1).toISOString()
    });
  }

  callback(false);
};

model.getAccessToken = function(bearerToken, done) {
  for (var i = 0, len = accessTokens.length; i < len, i++) {
    var elem = accessTokens[i];
    if (elem.accessToken === bearerToken) {
      return done(false, elem);
    }
  }
  done(false, false)
};

model.saveAuthorizationCode = function(done) {

};

model.saveRefreshToken = function(refreshToken, clientId, expires, userId, done) {
  refreshTokens.unshift({
    refreshToken: refreshToken,
    clientId: clientId,
    userId: userId,
    expires: expires
  });

  done(false);
};

model.getRefreshToken = function(bearerToken, done) {
  for (var i = 0, len = refreshTokens.length; i < len; i++) {
    var elem = refreshTokens[i];
    if (elem.refreshToken === bearerToken) {
      return done(false, elem);
    }
  }
  done(false, false);
};

model.getClient = function (clientId, done) {
  done(false, getOAuthClient(clientId));
};

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, done) {
  for (var i = 0, len = users.length; i < len; i++) {
    var elem = users[i];
    if(elem.username === username && elem.password === password) {
      return done(false, elem);
    }
  }
  done(false, false);
};

model.validateScope = function(token, scope, done) {
  done(false, scope === "projector:all");
};

model.generateAccessToken = generateRandomCode;
model.generateRefreshToken = generateRandomCode;
model.generateAuthorizationCode = generateRandomCode;

// For generating random number/letter combinations
function smallGenerator() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(32)
               .substring(1);
}

// For generating a larger random code
function generateRandomCode() {
  var rand = "";
  for (int i = 0; i < 4; i++) {
    rand += smallGenerator()
  }
  return rand;
}

// Returns a date object set for 1 hour in the future
function hoursFromNow(h) {
  if (!h) {
    h = 1;
  }
  var now = new Date();
  now.setTime(now.getTime() + (1000 * 60 * 60 * h));
  return now;
}

function getOAuthClient(clientId) {
  for (var i = 0, len = oauthClients.length; i < len; i++) {
    var elem = oauthClients[i];
    if (elem.clientId === clientId) {
      return elem;
    }
  }
  return false;
}

function getUser(userId) {
  for (var i = 0, len = users.length; i < len; i++) {
    var elem = users[i];
    if (elem.id == userId) {
      return elem;
    }
  }
  return false;
};

