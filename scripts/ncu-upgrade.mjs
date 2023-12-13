import { spawnSync } from 'child_process'

const params = process.argv.slice(2)

const projects = ['schema', 'calculation', 'ui']

for (const project of projects) {
    const { status } = spawnSync('ncu', params, {
        cwd: project,
        stdio: 'inherit',
    })

    if (status !== 0) {
        console.error(
            `Kod wyjścia polecenia dla projektu ${project}: ${status || ''}`
        )
        break
    }
}
