/** @param {NS} ns */
export async function main(ns) {
  let host = ns.getHostname();
  while (true) {
    if (ns.getServerSecurityLevel(host) > ns.getServerMinSecurityLevel(host) + 1) {
      await ns.weaken(host);
    }
    await ns.sleep(5000);
  }
}