/** @param {NS} ns */
export async function main(ns) {

  while (true) {
    await ns.sleep(10);
    let servers = ns.scan();
    const serversArray = servers;
    let randomList = shuffle([...servers]);
    for (let i = 0; i < randomList.length; i++) {
      if (randomList[i] == "home") {
        continue;
      }
      if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(randomList[i])) {
        continue;
      }

      // brute force through all the available tools
      if (!ns.hasRootAccess(randomList[i])) {

        if (ns.fileExists("BruteSSH.exe", "home")) {
          ns.brutessh(randomList[i]);
          await ns.sleep(5000);
        };

        if (ns.fileExists("FTPCrack.exe", "home")) {
          ns.ftpcrack(randomList[i]);
          await ns.sleep(5000);
        };

        if (ns.fileExists("relaySMTP.exe", "home")) {
          ns.relaysmtp(randomList[i]);
          await ns.sleep(5000);
        };

        if (ns.fileExists("HTTPWorm.exe", "home")) {
          ns.httpworm(randomList[i]);
          await ns.sleep(5000);
        }

        if (ns.fileExists("SQLInject.exe", "home")) {
          ns.sqlinject(randomList[i]);
          await ns.sleep(5000);
        }

        try {
          ns.nuke(randomList[i]);
          await ns.sleep(5000);
        } catch { }

      } else {
        await ns.hack(randomList[i]);
        await ns.sleep(5000);
      }
    }
  }
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}