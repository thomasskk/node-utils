import * as htmlparser2 from 'htmlparser2';

const PARENT_KEY = "_parent";

const nativeType = (value: string): string | boolean => {
  const trimmed = value.trim();
  const maybeBool = trimmed.toLowerCase();
  if (maybeBool === 'true') return true;
  if (maybeBool === 'false') return false;
  return trimmed
};

const formatText = (text: string): string => {
  return text.split('\n').map(line => line.trim()).join('');
}

const formatAttributes = (attributes: Record<string, unknown>): Record<string, string | boolean> => {
  const formattedAttributes: Record<string, string | boolean> = {};
  for (const key of Object.keys(attributes)) {
    formattedAttributes[key] = nativeType((attributes[key] as string)?.trim());
  }
  return formattedAttributes;
};

export const xml2js = (xml: string): Record<string, any> => {
  let currentElement: Record<string, any> = {};
  let currentTagName = ""

  const parser = new htmlparser2.Parser({
    onopentag: (tagName, attributes) => {
      const formattedAttributes = formatAttributes(attributes);
      currentTagName = tagName;

      const haveAttributes = Object.keys(formattedAttributes).length > 0;
      const element: Record<string, unknown> = haveAttributes ? formattedAttributes : {};

      if (!currentElement[tagName]) {
        currentElement[tagName] = element;
      } else {
        if (!Array.isArray(currentElement[tagName])) {
          currentElement[tagName] = [currentElement[tagName]];
        }

        if (haveAttributes) {
          currentElement[tagName].push(element);
        }
      }

      element[PARENT_KEY] = currentElement;
      currentElement = element;
    },

    ontext: (text) => {
      if (Object.keys(currentElement).length === 0) return
      if (!text.trim()) return;
      const native = nativeType(text);
      const value = typeof native === "boolean" ? native : formatText(text);

      const parent = currentElement[PARENT_KEY];

      if (Object.keys(parent[currentTagName]).length > 1 && !Array.isArray(parent[currentTagName])) {
        parent[currentTagName] = [currentElement];
      }

      if (Array.isArray(parent[currentTagName])) {
        parent[currentTagName].push(value);
      } else {
        parent[currentTagName] = value;
      }
    },

    onclosetag: () => {
      const parentElement = currentElement[PARENT_KEY];
      delete currentElement[PARENT_KEY];
      currentElement = parentElement;
    }
  }, { xmlMode: true })

  parser.write(xml)
  parser.end()

  return currentElement
}

