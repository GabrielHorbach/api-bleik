const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');

const config = require('./config.json');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
  steam: client,
  community: community,
  language: 'en'
});

const logOnOptions = {
  accountName: config.username,
  password: config.password,
  // need sharedSecret from steam
  twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

client.logOn(logOnOptions);

// action after to login steam bot
client.on('loggedOn', () => {
  console.log('###########\n\n  LOGGED\n\n###########');
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed(440);
});

client.on('webSession', (sessionid, cookies) => {
  // sessionid renove in each serverrun
  manager.setCookies(cookies);

  community.setCookies(cookies);
  community.startConfirmationChecker(20000, config.identitySecret);

  sendFirstTradableItemFromInventory();
});

function sendFirstTradableItemFromInventory() {
  manager.loadInventory(440, 2, true, (err, inventory) => {
    if (err) {
      console.log(err);
    } else {
      console.log("\n\n  ### Bruno's Inventory\n\n");
      console.log(inventory);
      console.log("\n\n");

      //create an offer using daniel steamID, but can be used a token also
      const offer = manager.createOffer('76561198085122883');
      const itemSelected = inventory[0];
      offer.addMyItem(itemSelected);

      console.log("### Item selected ###\n\n");
      console.log(itemSelected);

      offer.setMessage('Item enviado do server!');
      offer.send((err, status) => {
        if (err) {
          console.log("### ERROR ###")
          console.log(err);
        } else {
          console.log("### Trade sent! ###");
          console.log(status);
        }
      });
    }
  });
}