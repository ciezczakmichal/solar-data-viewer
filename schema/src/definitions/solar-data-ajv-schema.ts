import { JSONSchemaType } from 'ajv'
import { MessageType } from './message'
import { SolarDataSchema, SolarDataVersion } from './solar-data'
import { UnitOfMeasure } from './tariff-item'

// JSON Schema draft-07
export const SolarDataAjvSchema: JSONSchemaType<SolarDataSchema> = {
    definitions: {
        ISO8601Date: {
            type: 'string',
            // dwa znaki "\", aby w regex znalazł się jeden
            pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$',
        },

        BaseYieldValuesRecord: {
            type: 'object',
            properties: {
                totalYield: {
                    type: 'number',
                },
            },
            required: ['totalYield'],
        },
        BaseMeterValuesRecord: {
            type: 'object',
            properties: {
                charged: {
                    type: 'number',
                },
                donated: {
                    type: 'number',
                },
            },
            required: ['charged', 'donated'],
        },
        BaseCompleteValuesRecord: {
            type: 'object',
            allOf: [
                { $ref: '#/definitions/BaseYieldValuesRecord' },
                { $ref: '#/definitions/BaseMeterValuesRecord' },
            ],
            required: ['totalYield', 'charged', 'donated'],
        },
        BaseValuesRecord: {
            type: 'object',
            anyOf: [
                { $ref: '#/definitions/BaseYieldValuesRecord' },
                { $ref: '#/definitions/BaseMeterValuesRecord' },
                { $ref: '#/definitions/BaseCompleteValuesRecord' },
            ],
            required: [],
        },

        ValuesRecordProperties: {
            type: 'object',
            properties: {
                meterId: {
                    type: 'integer',
                },
                date: {
                    $ref: '#/definitions/ISO8601Date',
                },
                comment: {
                    type: 'string',
                },
            },
            required: ['meterId', 'date'],
        },
        YieldValuesRecord: {
            type: 'object',
            allOf: [
                { $ref: '#/definitions/ValuesRecordProperties' },
                { $ref: '#/definitions/BaseYieldValuesRecord' },
            ],
            required: ['meterId', 'date', 'totalYield'],
        },
        MeterValuesRecord: {
            type: 'object',
            allOf: [
                { $ref: '#/definitions/ValuesRecordProperties' },
                { $ref: '#/definitions/BaseMeterValuesRecord' },
            ],
            required: ['meterId', 'date', 'charged', 'donated'],
        },
        CompleteValuesRecord: {
            type: 'object',
            allOf: [
                { $ref: '#/definitions/YieldValuesRecord' },
                { $ref: '#/definitions/MeterValuesRecord' },
            ],
            required: ['meterId', 'date', 'totalYield', 'charged', 'donated'],
        },
        ValuesRecord: {
            type: 'object',
            anyOf: [
                { $ref: '#/definitions/YieldValuesRecord' },
                { $ref: '#/definitions/MeterValuesRecord' },
                { $ref: '#/definitions/CompleteValuesRecord' },
            ],
            required: [],
        },
    },
    type: 'object',
    properties: {
        version: {
            type: 'integer',
            const: SolarDataVersion,
        },
        messages: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        enum: Object.values(MessageType),
                    },
                    text: {
                        type: 'string',
                    },
                    url: {
                        type: 'string',
                        nullable: true,
                    },
                },
                required: ['type', 'text'],
            },
            // @todo nie pozwól na NULL - możliwe w przyszłej wersji AJV v.9
            // https://github.com/ajv-validator/ajv/issues/1664
            nullable: true,
        },
        meters: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                    },
                    installationDate: {
                        $ref: '#/definitions/ISO8601Date',
                    },
                    initialValues: {
                        $ref: '#/definitions/BaseValuesRecord',
                    },
                    comment: {
                        type: 'string',
                        nullable: true,
                    },
                },
                required: ['id', 'installationDate', 'initialValues'],
            },
        },
        values: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                $ref: '#/definitions/ValuesRecord',
                required: [],
            },
        },
        plantProperties: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    minLength: 1,
                    nullable: true,
                },
                installationPower: {
                    type: 'number',
                },
                pitch: {
                    type: 'number',
                    nullable: true,
                },
                orientation: {
                    type: 'number',
                    nullable: true,
                },
                panelsArea: {
                    type: 'number',
                    nullable: true,
                },
                investmentCost: {
                    type: 'number',
                },
                energyInWarehouseFactor: {
                    type: 'number',
                },
            },
            required: [
                'installationPower',
                'investmentCost',
                'energyInWarehouseFactor',
            ],
        },
        yieldForecast: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    month: {
                        type: 'integer',
                    },
                    value: {
                        type: 'number',
                    },
                },
                required: ['month', 'value'],
            },
            // @todo nie pozwól na NULL - możliwe w przyszłej wersji AJV v.9
            // https://github.com/ajv-validator/ajv/issues/1664
            nullable: true,
        },
        tariff: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 1,
                    },
                    unitOfMeasure: {
                        type: 'string',
                        enum: Object.values(UnitOfMeasure),
                    },
                    values: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                from: {
                                    $ref: '#/definitions/ISO8601Date',
                                },
                                value: {
                                    type: 'number',
                                },
                                comment: {
                                    type: 'string',
                                    nullable: true,
                                },
                            },
                            required: ['from', 'value'],
                        },
                    },
                },
                required: ['name', 'unitOfMeasure', 'values'],
            },
        },
        vatRates: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    from: {
                        $ref: '#/definitions/ISO8601Date',
                    },
                    value: {
                        type: 'integer',
                    },
                    comment: {
                        type: 'string',
                        nullable: true,
                    },
                },
                required: ['from', 'value'],
            },
        },
    },
    required: [
        'version',
        'meters',
        'values',
        'plantProperties',
        'tariff',
        'vatRates',
    ],
}
