/** @param {NS} ns */
export async function main(ns) {
  let host = ns.getHostname();
  while (true) {
    if (ns.getServerMaxMoney(host) < ns.getServerMoneyAvailable(host) * 0.5) {
      await ns.grow(host);
    }
    await ns.sleep(5000);
  }
}