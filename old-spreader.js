/** @param {NS} ns */
export async function main(ns) {
  const thisScriptRAM = 4.3;

  while (true) {
    const host = ns.getHostname(); // Get current hostname
    const markerFile = `spreaded_${host}.txt`; // Unique marker file per host to avoid repetitive spreading/looping
    const homeMaxRAM = ns.getServerMaxRam("home");
    const homeUsedRAM = ns.getServerUsedRam("home");



    // Only mark once per host
    if (!ns.fileExists(markerFile, host)) {
      ns.write(markerFile, "true", "w"); // Mark as spreaded
    }

    // Run money-print.js on home if possible
    const moneyScriptRAM = ns.getScriptRam("money-print.js");
    const maxInstances = Math.floor((homeMaxRAM - homeUsedRAM) / moneyScriptRAM);

    for (let i = 0; i < maxInstances; i++) {
        try { ns.exec("money-print.js", "home", 1, i); } catch { } 
        await ns.sleep(100); // Slight delay to prevent overload on home
    }

    // Get neighbors excluding self
    const neighbors = ns.scan().filter(s => s !== host);
    if (neighbors.length === 0) {
      ns.print("exiting old-spreader.js on " + host + " - no neighbors");
      await ns.sleep(60000); // Wait a minute before checking again
      continue;
    }

    // Create a shuffled list of neighbors
    const randomList = shuffle(neighbors);

    // Iterate through the randomized list of neighbors
    for (let i = 0; i < randomList.length; i++) {
      ns.print("old-spreader.js on " + host + " - processing target " + randomList[i]); // log output
      const target = randomList[i];
      const maxRAM = ns.getServerMaxRam(target); // Get target's max RAM to verify if money-print can be deployed later on
      const allScriptsRAM = ns.getScriptRam("old-spreader.js", "home") + ns.getScriptRam("weakener.js", "home") + ns.getScriptRam("grower.js", "home")

        // Try to gain root access if not already there
    if (!ns.hasRootAccess(target)) {
        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(target);
            await ns.sleep(5000);
        }
        if (ns.fileExists("FTPCrack.exe", "home")) {
            ns.ftpcrack(target);
            await ns.sleep(5000);
        }
        if (ns.fileExists("relaySMTP.exe", "home")) {
            ns.relaysmtp(target);
            await ns.sleep(5000);
        }
        if (ns.fileExists("HTTPWorm.exe", "home")) {
            ns.httpworm(target);
            await ns.sleep(5000);
        }
        if (ns.fileExists("SQLInject.exe", "home")) {
            ns.sqlinject(target);
            await ns.sleep(5000);
        }
        try { ns.nuke(target); } catch { }
        await ns.sleep(5000);
    }
      

      // If there isn't enough room to run all scripts, use that host only as a host for spreading
      if (ns.hasRootAccess(target) && maxRAM < allScriptsRAM) {
        try {runScriptOnHost(ns, "old-spreader.js", target);} catch { }
        continue;
      }

      // Ensure that only money-print.js is run on home, since neither grower nor weakener work there
      if (target === "home") { 
        continue;
      }

      // Skip n00dles and go straight to max-hardware once hacking level is sufficient. This is because n00dles doesn't have enough RAM to run the necessary scripts
      if (target === "n00dles" && ns.getHackingLevel() > 80) { 
        try {runScriptOnHost(ns, "old-spreader.js", "max-hardware");} catch { }
        continue;
      }

      // If root access is available and there's enough RAM, first run grower and weakener. Once they're started (each has while-true loop), fill remaining RAM with money-print.js & 1x spreader
      if (ns.hasRootAccess(target) && maxRAM > thisScriptRAM) {
        // Ensure grower and weakener are running first
        try {runScriptOnHost(ns, "grower.js", target);} catch { }
        try {runScriptOnHost(ns, "weakener.js", target);} catch { }

        // Spread old-spreader if not already running
        if (!ns.isRunning("old-spreader.js", target)) {
          try {runScriptOnHost(ns, "old-spreader.js", target);} catch { }
        }

        // Now check if both are running, then fill with money-print. This ensures that regular grow() and weaken() cycles are maintained alongside money-printing
        if (ns.getRunningScript("grower.js", target) && ns.getRunningScript("weakener.js", target) && ns.getRunningScript("old-spreader.js", target)) {
          while (maxRAM - ns.getServerUsedRam(target) > ns.getScriptRam("money-print.js")) {
            try {runScriptOnHost(ns, "money-print.js", target);} catch { }
          }
        }
      }
    }
    await ns.sleep(60000); // Wait a minute before next spreading attempt
  }
}

// Found on Reddit
function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Function for running a script on a host
function runScriptOnHost(ns, file, host, condition) {
  if (ns.getServerMaxRam(host) - ns.getServerUsedRam(host) < ns.getScriptRam(file)) {
    return;
  }
  if (ns.getRunningScript(file, host) && file !== "money-print.js") {
    return;
  } else {
    ns.scp(file, host, "home");
    ns.exec(file, host, 1);
  }
}