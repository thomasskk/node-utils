import * as htmlparser2 from 'htmlparser2';

const PARENT_KEY = "_parent";

const nativeType = (value: string) => {
  const maybeBool = value.toLowerCase().trim();
  if (maybeBool === 'true') return true;
  if (maybeBool === 'false') return false;
  return value.trim();
};

const formatText = (text: string) => {
  return text.split('\n').map(line => line.trim()).join('');
}

const formatAttributes = (attributes: Record<string, unknown>) => {
  for (const key of Object.keys(attributes)) {
    attributes[key] = nativeType((attributes[key] as string)?.trim());
  }
  return attributes;
};

export const xml2js = (xml: string) => {
  let currentElement: Record<string, any> = {};
  let currentTagName = ""

  const parser = new htmlparser2.Parser({
    onopentag: (tagName, attributes) => {
      const formattedAttributes = formatAttributes(attributes);
      currentTagName = tagName;

      const haveAttributes = !!Object.keys(formattedAttributes).length;
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

  return currentElement;
}
