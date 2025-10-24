/* Konieczne obejścia z powodu błędu https://github.com/ajv-validator/ajv/issues/2132 */

import AjvModule from 'ajv'
const Ajv = AjvModule.default

import StandaloneCodeModule from 'ajv/dist/standalone/index.js'
const standaloneCode = StandaloneCodeModule.default

import { writeFileSync } from 'fs'
import { SolarDataAjvSchema } from '../lib/definitions/solar-data-ajv-schema.js'

const ajv = new Ajv({
    messages: false, // ze względu na użycie ajv-i18n
    code: {
        source: true,
        esm: true, // niewspierane przez Ajv CLI https://github.com/ajv-validator/ajv-cli/pull/200
    },
})

const validate = ajv.compile(SolarDataAjvSchema)
let moduleCode = standaloneCode(ajv, validate)

/*
 * Kod wynikowy używa funkcji require(), która nie występuje w ESM - konieczna podmiana.
 * Dodatkowo importowanie domyślne działa nieoczekiwanie podczas wykonywania testów jednostkowych
 * (Jest) - dodatkowy poziom obiektu - stąd dodatkowe przypisanie.
 */
const data = {
    search: 'const func2 = require("ajv/dist/runtime/ucs2length").default',
    replace: `import { default as func2_import } from 'ajv/dist/runtime/ucs2length';
              const func2 = func2_import.default || func2_import;`,
}

moduleCode = moduleCode.replace(data.search, data.replace.replace('\n', ''))
writeFileSync('lib/generated/validator-standalone.js', moduleCode)
