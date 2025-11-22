/** @param {NS} ns */
export async function main(ns) {
    const servers = shuffle(getAllServers(ns));

    for (const server of servers) {
        if (server === "home") continue;
        if (!ns.hasRootAccess(server)) continue;

        // spread money printing script, and weakening script
        ns.scp("money-print.js", server);
        ns.scp("weakener.js", server);

        if (!ns.isRunning("money-print.js", server)) {
            const pid = ns.exec("money-print.js", server, 1);
            if (pid === 0) continue; // avoid freeze from failing exec
        }
    }

    await ns.sleep(6000);
}

function getAllServers(ns) {
    const visited = new Set();
    const stack = ["home"];

    while (stack.length > 0) {
        const host = stack.pop();
        if (visited.has(host)) continue;

        visited.add(host);
        for (const next of ns.scan(host)) {
            if (!visited.has(next)) stack.push(next);
        }
    }
    return [...visited];
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}