import {
  __decorateClass
} from "../chunk-ADS4GRIL.js";

// commands/generate.ts
import { fileURLToPath as fileURLToPath2 } from "url";
import { Project, QuoteKind } from "ts-morph";
import { BaseCommand, flags } from "@adonisjs/core/ace";

// src/codegen/api_types_generator.ts
import { Node } from "ts-morph";
import matchit from "@poppinss/matchit";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { dirname, relative } from "path";
import { existsSync, mkdirSync } from "fs";
import string from "@adonisjs/core/helpers/string";
import { assertExists } from "@adonisjs/core/helpers/assert";
import { parseBindingReference, slash } from "@adonisjs/core/helpers";
var ApiTypesGenerator = class {
  #appRoot;
  #logger;
  #project;
  #config;
  #routes;
  #destination;
  #cachedPkgJson;
  constructor(options) {
    this.#config = options.config;
    this.#routes = options.routes;
    this.#logger = options.logger;
    this.#project = options.project;
    this.#appRoot = options.appRoot;
    this.#prepareDestination();
  }
  async #loadPkgJson() {
    if (this.#cachedPkgJson) return this.#cachedPkgJson;
    try {
      const pkgJsonText = await readFile(
        fileURLToPath(new URL("./package.json", this.#appRoot)),
        "utf-8"
      );
      this.#cachedPkgJson = JSON.parse(pkgJsonText);
      return this.#cachedPkgJson;
    } catch (error) {
      throw new Error("Unable to read the package.json file", { cause: error });
    }
  }
  #isPackageInstalled(name) {
    assertExists(
      this.#cachedPkgJson,
      "package.json should be loaded before checking if a package is installed"
    );
    return !!this.#cachedPkgJson.dependencies?.[name];
  }
  #getDestinationDirectory() {
    return dirname(this.#destination);
  }
  /**
   * Create the destination directory if it does not exists
   */
  #prepareDestination() {
    this.#destination = fileURLToPath(new URL("./.adonisjs/api.ts", this.#appRoot));
    const directory = this.#getDestinationDirectory();
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
  }
  /**
   * Extract class and method of the route handler
   */
  #extractClassHandlerData(file, routeHandler) {
    const classDef = file.getClasses().find((c) => c.isDefaultExport());
    if (!classDef) return;
    const method = classDef.getMethod(routeHandler.method);
    if (!method) return;
    const body = method.getBody();
    if (!body) return;
    return { method, body, file };
  }
  /**
   * Get the import type of an identifier
   */
  #getIdentifierImportType(identifier) {
    const sourceFile = identifier.getSourceFile();
    const namedImport = sourceFile.getImportDeclaration((importNode) => {
      const namedImports = importNode.getNamedImports();
      if (namedImports.find((namedImport2) => namedImport2.getName() === identifier.getText())) {
        return true;
      }
      return false;
    });
    const defaultImport = sourceFile.getImportDeclaration((importNode) => {
      if (importNode.getDefaultImport()?.getText() === identifier.getText()) return true;
      return false;
    });
    const isValidFile = (namedImport || defaultImport)?.getModuleSpecifierSourceFile();
    if (!isValidFile) return void 0;
    if (namedImport) return "named";
    if (defaultImport) return "default";
    return void 0;
  }
  /**
   * This method will returns the path to the schema file
   */
  #extractRequest(handlerData) {
    const validateUsingCallNode = handlerData.method.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) return false;
      if (node.getExpression().getText().includes("validateUsing")) {
        return node;
      }
      return false;
    });
    if (!validateUsingCallNode) return;
    const schema = validateUsingCallNode.getArguments()[0];
    if (Node.isIdentifier(schema)) {
      const definition = schema.getDefinitions().at(0);
      const importType = this.#getIdentifierImportType(schema);
      const isReExportedFromThisFile = definition ? handlerData.file.getExportedDeclarations().has(definition.getNode().getText()) : false;
      if (!importType && !isReExportedFromThisFile) {
        this.#logger.warning(`Unable to find the schema file for ${schema.getText()}`);
        return;
      }
      const importPath = definition.getSourceFile().getFilePath();
      const relativeImportPath = slash(relative(this.#getDestinationDirectory(), importPath));
      const propName = importType === "default" ? "default" : schema.getText();
      return `InferInput<typeof import('${relativeImportPath}')['${propName}']>`;
    }
    if (Node.isPropertyAccessExpression(schema)) {
      const baseExpression = schema.getExpression();
      const propertyName = schema.getName();
      if (Node.isIdentifier(baseExpression)) {
        const className = baseExpression.getText();
        const classDeclaration = handlerData.file.getClass(className);
        if (!classDeclaration) return;
        const staticProperty = classDeclaration.getStaticMember(propertyName);
        if (!staticProperty) return;
        const importPath = classDeclaration.getSourceFile().getFilePath();
        const relativeImportPath = slash(relative(this.#getDestinationDirectory(), importPath));
        return `InferInput<typeof import('${relativeImportPath}').default['${propertyName}']>`;
      }
    }
  }
  /**
   * Generate the final interface containing all routes, request, and response
   */
  #generateDefinitionInterface(types, indent = "  ") {
    let interfaceContent = "";
    Object.entries(types).forEach(([key, value]) => {
      if (typeof value === "object") {
        interfaceContent += `${indent}'${key}': {
`;
        interfaceContent += this.#generateDefinitionInterface(value, indent + "  ");
        interfaceContent += `${indent}};
`;
      } else {
        interfaceContent += `${indent}'${key}': ${value};
`;
      }
    });
    return interfaceContent;
  }
  /**
   * Filter routes to generate based on the config
   */
  #filterRoutes(routes, mode) {
    const config = this.#config.codegen?.[mode];
    if (!config || !config.only && !config.except) return routes;
    return routes.filter((route) => {
      if (typeof config.only === "function") return config.only(route);
      if (typeof config.except === "function") return !config.except(route);
      if (config.only) {
        for (const pattern of config.only) {
          if (pattern instanceof RegExp && pattern.test(route.pattern)) return true;
          if (route.pattern === pattern) return true;
        }
        return false;
      }
      if (config.except) {
        for (const pattern of config.except) {
          if (pattern instanceof RegExp && pattern.test(route.pattern)) return false;
          if (route.pattern === pattern) return false;
        }
        return true;
      }
      return true;
    });
  }
  /**
   * Generate a type name based on the route pattern and methods
   *
   * GET /users/:id => UsersIdGet
   */
  #generateTypeName(route) {
    const remappedSegments = route.pattern.split("/").filter(Boolean).map((segment) => segment.startsWith(":") ? "id" : segment).join(" ");
    const methods = string.pascalCase(route.methods.join(" "));
    return string.pascalCase(remappedSegments) + methods;
  }
  #generateRoutesNameArray(routes, typesByPattern) {
    return routes.map(({ name, pattern, methods }) => {
      const params = matchit.parse(pattern).filter((node) => node.type !== 0).map((node) => node.val);
      let typeName = this.#generateTypeName({ pattern, methods });
      if (!typesByPattern[typeName]) typeName = "unknown";
      return { params, name, path: pattern, method: methods, types: typeName };
    }).filter((route) => !!route.name);
  }
  async #writeIndexFile() {
    const filePath = this.#getDestinationDirectory() + "/index.ts";
    const exist = existsSync(filePath);
    if (exist) {
      return;
    }
    const file = this.#project.createSourceFile(filePath, "", {
      overwrite: true
    });
    if (!file) throw new Error("Unable to create the index.ts file");
    file.removeText().insertText(0, (writer) => {
      writer.writeLine(`/// <reference path="../adonisrc.ts" />`);
      writer.newLine();
      writer.writeLine(`export * from './api.js'`);
    });
    await file.save();
  }
  /**
   * If @tuyau/superjson is installed then we must use a special
   * type that will not type-serialize the response
   */
  #getMakeTuyauResponseType() {
    const isSuperJsonInstalled = this.#isPackageInstalled("@tuyau/superjson");
    return isSuperJsonInstalled ? "MakeNonSerializedTuyauResponse" : "MakeTuyauResponse";
  }
  async #writeApiFile(options) {
    const file = this.#project.createSourceFile(this.#destination, "", { overwrite: true });
    if (!file) throw new Error("Unable to create the api.ts file");
    const isTuyauInertiaInstalled = this.#isPackageInstalled("@tuyau/inertia");
    const makeTuyauResponseType = this.#getMakeTuyauResponseType();
    file.removeText().insertText(0, (writer) => {
      writer.writeLine(`// @ts-nocheck`).writeLine(`/* eslint-disable */`).writeLine("// --------------------------------------------------").writeLine("// This file is auto-generated by Tuyau. Do not edit manually !").writeLine("// --------------------------------------------------").writeLine("").writeLine(
        `import type { MakeTuyauRequest, ${makeTuyauResponseType} } from '@tuyau/utils/types'`
      ).writeLine(`import type { InferInput } from '@vinejs/vine/types'`).newLine();
      Object.entries(options.typesByPattern).forEach(([key, value]) => {
        writer.writeLine(`type ${key} = {`);
        writer.writeLine(`  request: ${value.request}`);
        writer.writeLine(`  response: ${value.response}`);
        writer.writeLine(`}`);
      });
      writer.writeLine(`export interface ApiDefinition {`).write(this.#generateDefinitionInterface(options.definition, "  ")).writeLine(`}`);
      writer.writeLine(`const routes = [`);
      for (const route of options.routesNameArray) {
        writer.writeLine(`  {`);
        writer.writeLine(`    params: ${JSON.stringify(route.params)},`);
        writer.writeLine(`    name: '${route.name}',`);
        writer.writeLine(`    path: '${route.path}',`);
        writer.writeLine(`    method: ${JSON.stringify(route.method)},`);
        writer.writeLine(`    types: {} as ${route.types},`);
        writer.writeLine(`  },`);
      }
      writer.writeLine(`] as const;`);
      writer.writeLine(`export const api = {`).writeLine(`  routes,`).writeLine(`  definition: {} as ApiDefinition`).writeLine(`}`);
      if (isTuyauInertiaInstalled) {
        writer.writeLine(`declare module '@tuyau/inertia/types' {`);
        writer.writeLine(`  type InertiaApi = typeof api`);
        writer.writeLine(`  export interface Api extends InertiaApi {}`);
        writer.writeLine(`}`);
      }
    });
    await file.save();
  }
  async generate() {
    const definition = {};
    const typesByPattern = {};
    const sourcesFiles = this.#project.getSourceFiles();
    const routes = this.#filterRoutes(this.#routes, "definitions");
    await this.#loadPkgJson();
    for (const route of routes) {
      if (typeof route.handler === "function") continue;
      const routeHandler = await parseBindingReference(route.handler.reference);
      const file = sourcesFiles.find((sf) => {
        const filePath = sf.getFilePath();
        
        // Support pour la structure exotique avec app/core/*/controllers/
        const normalizedModulePath = routeHandler.moduleNameOrPath
          .replace("./", "")
          .replace(".js", "")
          .replace("#", "");
        
        // Recherche flexible qui supporte différentes structures de dossiers
        const patterns = [
          // Pattern original
          routeHandler.moduleNameOrPath.startsWith("./") 
            ? routeHandler.moduleNameOrPath.replace("./", "").replace(".js", ".ts")
            : `${routeHandler.moduleNameOrPath.replace("#", "")}.ts`,
          // Pattern pour la structure exotique
          `core/auth/controllers/${normalizedModulePath.split('/').pop()}.ts`,
          `core/main/controllers/app/${normalizedModulePath.split('/').pop()}.ts`,
          `core/main/controllers/landing/${normalizedModulePath.split('/').pop()}.ts`,
          // Pattern générique pour toute structure dans app/
          `${normalizedModulePath}.ts`
        ];
        
        return patterns.some(pattern => {
          const matches = filePath.endsWith(pattern);
          return matches;
        });
      });
      if (!file) {
        this.#logger.warning(`Unable to find the controller file for ${route.pattern}`);
        continue;
      }
      this.#logger.info(`Generating types for ${route.pattern}`);
      const handlerData = this.#extractClassHandlerData(file, routeHandler);
      if (!handlerData) {
        this.#logger.warning(`Unable to find the controller method for ${route.pattern}`);
        continue;
      }
      const schemaImport = this.#extractRequest(handlerData);
      const methods = route.methods.map((method) => "$" + method.toLowerCase()).filter((method) => method !== "head");
      const segments = route.pattern.split("/").filter(Boolean);
      let currentLevel = definition;
      const relativePath = slash(relative(this.#getDestinationDirectory(), file.getFilePath()));
      segments.forEach((segment, i) => {
        if (!currentLevel[segment]) currentLevel[segment] = {};
        currentLevel = currentLevel[segment];
        if (i !== segments.length - 1) return;
        const typeName = this.#generateTypeName(route);
        const makeTuyauResponseType = this.#getMakeTuyauResponseType();
        typesByPattern[typeName] = {
          request: schemaImport ? `MakeTuyauRequest<${schemaImport}>` : "unknown",
          response: `${makeTuyauResponseType}<import('${relativePath}').default['${routeHandler.method}'], ${!!schemaImport}>`
        };
        currentLevel.$url = {};
        for (const method of methods) currentLevel[method] = typeName;
      });
    }
    const routesNameArray = this.#generateRoutesNameArray(
      this.#filterRoutes(routes, "routes"),
      typesByPattern
    );
    await this.#writeApiFile({ definition, typesByPattern, routesNameArray });
    await this.#writeIndexFile();
  }
};

// commands/generate.ts
var CodegenTypes = class extends BaseCommand {
  static commandName = "tuyau:generate";
  static description = "Tuyau generator command";
  static options = { startApp: true };
  /**
   * Get routes from the router instance
   */
  async #getRoutes() {
    const router = await this.app.container.make("router");
    router.commit();
    return router.toJSON().root;
  }
  /**
   * Execute command
   */
  async run() {
    const project = new Project({
      manipulationSettings: { quoteKind: QuoteKind.Single },
      tsConfigFilePath: fileURLToPath2(new URL("./tsconfig.json", this.app.appRoot))
    });
    const apiTypesGenerator = new ApiTypesGenerator({
      project,
      logger: this.logger,
      appRoot: this.app.appRoot,
      routes: await this.#getRoutes(),
      config: this.app.config.get("tuyau")
    });
    await apiTypesGenerator.generate();
    this.logger.success("Types generated successfully");
  }
};
__decorateClass([
  flags.boolean({ description: "Verbose logs", default: false, alias: "v" })
], CodegenTypes.prototype, "verbose", 2);
export {
  CodegenTypes as default
};
