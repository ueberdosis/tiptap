/* eslint-disable semi */
export default function transform(file: any, api: any) {
  const j = api.jscodeshift as typeof import("jscodeshift");
  const root = j(file.source);
  let dirtyFlag = false;

  // Define the mapping of old module paths to the new consolidated module path
  const moduleMapping = {
    // extension-table
    "@tiptap/extension-table": "Table",
    "@tiptap/extension-table-row": "TableRow",
    "@tiptap/extension-table-cell": "TableCell",
    "@tiptap/extension-table-header": "TableHeader",
    // extension-list
    "@tiptap/extension-list-item": "ListItem",
    "@tiptap/extension-bullet-list": "BulletList",
    "@tiptap/extension-ordered-list": "OrderedList",
    "@tiptap/extension-task-item": "TaskItem",
    "@tiptap/extension-task-list": "TaskList",
    "@tiptap/extension-list-keymap": "ListKeymap",
    // extension-text-style
    "@tiptap/extension-text-style": "TextStyle",
    "@tiptap/extension-color": "Color",
    "@tiptap/extension-font-family": "FontFamily",
    // extensions
    "@tiptap/extension-character-count": "CharacterCount",
    "@tiptap/extension-dropcursor": "Dropcursor",
    "@tiptap/extension-gapcursor": "Gapcursor",
    "@tiptap/extension-focus": "Focus",
    "@tiptap/extension-history": "UndoRedo",
    "@tiptap/extension-placeholder": "Placeholder",
  };

  const importMapping = {
    // extension-table
    "@tiptap/extension-table": "@tiptap/extension-table",
    "@tiptap/extension-table-row": "@tiptap/extension-table",
    "@tiptap/extension-table-cell": "@tiptap/extension-table",
    "@tiptap/extension-table-header": "@tiptap/extension-table",
    // extension-list
    "@tiptap/extension-list-item": "@tiptap/extension-list",
    "@tiptap/extension-bullet-list": "@tiptap/extension-list",
    "@tiptap/extension-ordered-list": "@tiptap/extension-list",
    "@tiptap/extension-task-item": "@tiptap/extension-list",
    "@tiptap/extension-task-list": "@tiptap/extension-list",
    "@tiptap/extension-list-keymap": "@tiptap/extension-list",
    // extension-text-style
    "@tiptap/extension-text-style": "@tiptap/extension-text-style",
    "@tiptap/extension-color": "@tiptap/extension-text-style",
    "@tiptap/extension-font-family": "@tiptap/extension-text-style",
    // extensions
    "@tiptap/extension-character-count": "@tiptap/extensions",
    "@tiptap/extension-dropcursor": "@tiptap/extensions",
    "@tiptap/extension-gapcursor": "@tiptap/extensions",
    "@tiptap/extension-focus": "@tiptap/extensions",
    "@tiptap/extension-history": "@tiptap/extensions",
    "@tiptap/extension-placeholder": "@tiptap/extensions",
  };

  // Collect all import specifiers that need to be consolidated
  const importSpecifiers = {} as Record<(typeof importMapping)[keyof typeof importMapping], Array<any> | undefined>;

  // Find all relevant import declarations
  root.find(j.ImportDeclaration).forEach(path => {
    const sourceValue = path.node.source.value as keyof typeof moduleMapping;
    if (moduleMapping[sourceValue]) {
      path.node.specifiers?.forEach(specifier => {
        if (j.ImportDefaultSpecifier.check(specifier) || j.ImportSpecifier.check(specifier)) {
          const importedName = j.ImportDefaultSpecifier.check(specifier)
            ? moduleMapping[sourceValue]
            : specifier.imported.name;
          const localName = specifier.local?.name;
          if (!localName) {
            return;
          }
          if (!importSpecifiers[importMapping[sourceValue]]) {
            importSpecifiers[importMapping[sourceValue]] = [];
          }
          importSpecifiers[importMapping[sourceValue]]?.push(
            j.importSpecifier(j.identifier(importedName), localName !== importedName ? j.identifier(localName) : null),
          );
        }
      });
      j(path).remove();
      dirtyFlag = true;
    }
  });

  // If there are import specifiers to consolidate, create a new import declaration
  Object.entries(importSpecifiers).forEach(([destinationModule, specifiers]) => {
    if (Array.isArray(specifiers) && specifiers.length > 0) {
      const newImportDeclaration = j.importDeclaration(specifiers, j.literal(destinationModule));
      root.get().node.program.body.unshift(newImportDeclaration);
    }
  });

  // Find all import declarations from '@tiptap/react'
  root
    .find(
      j.ImportDeclaration,
      ({ source: { value } }) => value === "@tiptap/react" || value === "@tiptap/vue-3" || value === "@tiptap/vue-2",
    )
    .forEach(path => {
      const specifiers = path.node.specifiers;
      const newSpecifiers: any[] = [];
      const menusSpecifiers: any[] = [];

      if (!specifiers) {
        return;
      }

      // Separate specifiers into those that stay and those that move to '@tiptap/react/menus'
      specifiers.forEach(specifier => {
        if (
          j.ImportSpecifier.check(specifier) &&
          (specifier.imported.name === "FloatingMenu" || specifier.imported.name === "BubbleMenu")
        ) {
          menusSpecifiers.push(specifier);
        } else {
          newSpecifiers.push(specifier);
        }
      });

      // If there are specifiers to move, create a new import declaration
      if (menusSpecifiers.length > 0) {
        dirtyFlag = true;
        const menusImport = j.importDeclaration(menusSpecifiers, j.literal(`${path.value.source.value}/menus`));
        j(path).insertAfter(menusImport);
      }

      // Update the original import declaration or remove it if empty
      if (newSpecifiers.length > 0) {
        path.node.specifiers = newSpecifiers;
      } else {
        j(path).remove();
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = "tsx";
