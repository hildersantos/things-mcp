import { z } from 'zod';

export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: any[];
  anyOf?: JsonSchema[];
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}

export function zodToJsonSchema(zodSchema: z.ZodType): JsonSchema {
  let result: JsonSchema;
  
  // Handle ZodEffects (refined schemas) by extracting the underlying schema
  if ((zodSchema as any)._def?.typeName === 'ZodEffects') {
    const underlyingSchema = (zodSchema as any)._def.schema;
    result = zodToJsonSchema(underlyingSchema);
  } else if (zodSchema instanceof z.ZodObject) {
    result = zodObjectToJsonSchema(zodSchema);
  } else if (zodSchema instanceof z.ZodString) {
    result = zodStringToJsonSchema(zodSchema);
  } else if (zodSchema instanceof z.ZodNumber) {
    result = zodNumberToJsonSchema(zodSchema);
  } else if (zodSchema instanceof z.ZodBoolean) {
    result = { type: 'boolean' };
  } else if (zodSchema instanceof z.ZodArray) {
    result = zodArrayToJsonSchema(zodSchema);
  } else if (zodSchema instanceof z.ZodOptional) {
    result = zodToJsonSchema(zodSchema.unwrap());
  } else if (zodSchema instanceof z.ZodEnum) {
    result = zodEnumToJsonSchema(zodSchema);
  } else if (zodSchema instanceof z.ZodUnion) {
    result = zodUnionToJsonSchema(zodSchema);
  } else if (zodSchema instanceof z.ZodLiteral) {
    result = {
      type: typeof zodSchema.value as any,
      enum: [zodSchema.value]
    };
  } else {
    // Fallback for unsupported types
    result = { type: 'string' };
  }
  
  // Extract description from Zod schema if available
  const zodTypeDef = (zodSchema as any)._def;
  if (zodTypeDef?.description) {
    result.description = zodTypeDef.description;
  }
  
  return result;
}

function zodObjectToJsonSchema(zodObject: z.ZodObject<any>): JsonSchema {
  const shape = zodObject.shape;
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const [key, zodType] of Object.entries(shape)) {
    const jsonSchema = zodToJsonSchema(zodType as z.ZodType);
    
    // Extract description from Zod schema if available
    const zodTypeDef = (zodType as any)._def;
    if (zodTypeDef?.description) {
      jsonSchema.description = zodTypeDef.description;
    }
    
    properties[key] = jsonSchema;
    
    if (!(zodType as z.ZodType).isOptional()) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 && { required })
  };
}

function zodStringToJsonSchema(zodString: z.ZodString): JsonSchema {
  const schema: JsonSchema = { type: 'string' };
  
  // Extract constraints
  const checks = (zodString as any)._def.checks || [];
  
  for (const check of checks) {
    switch (check.kind) {
      case 'min':
        schema.minLength = check.value;
        break;
      case 'max':
        schema.maxLength = check.value;
        break;
      case 'regex':
        // Could add pattern support here
        break;
    }
  }
  
  return schema;
}

function zodNumberToJsonSchema(zodNumber: z.ZodNumber): JsonSchema {
  const schema: JsonSchema = { type: 'number' };
  
  // Extract constraints
  const checks = (zodNumber as any)._def.checks || [];
  
  for (const check of checks) {
    switch (check.kind) {
      case 'min':
        schema.minimum = check.value;
        break;
      case 'max':
        schema.maximum = check.value;
        break;
    }
  }
  
  return schema;
}

function zodArrayToJsonSchema(zodArray: z.ZodArray<any>): JsonSchema {
  return {
    type: 'array',
    items: zodToJsonSchema(zodArray.element)
  };
}

function zodEnumToJsonSchema(zodEnum: z.ZodEnum<any>): JsonSchema {
  return {
    type: 'string',
    enum: zodEnum.options
  };
}

function zodUnionToJsonSchema(zodUnion: z.ZodUnion<any>): JsonSchema {
  const options = zodUnion.options.map((option: z.ZodType) => zodToJsonSchema(option));
  
  // If all options have the same type, merge them
  const types = [...new Set(options.map((opt: JsonSchema) => opt.type))];
  if (types.length === 1) {
    const baseSchema: JsonSchema = { type: types[0] as string };
    
    // Merge enum values if all are enums
    const allEnums = options.every((opt: JsonSchema) => opt.enum);
    if (allEnums) {
      baseSchema.enum = options.flatMap((opt: JsonSchema) => opt.enum || []);
    }
    
    return baseSchema;
  }
  
  return { anyOf: options };
}