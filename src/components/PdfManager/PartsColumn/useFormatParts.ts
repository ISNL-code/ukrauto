import { Part } from "../../../types/catalog";

export const useFormatParts = () => {
  const parsePartsFromText = (text: string): Omit<Part, "id">[] => {
    // console.log(text);

    // нормализуем все пробелы
    text = text.replace(/[\u00A0\s]+/g, " ").trim();

    const parsed: Omit<Part, "id">[] = [];
    let schemeCounter = 1;

    const tokens = text.split(" ");
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      // schemeNumber: 1–2 цифры и строго +1
      if (/^\d{1,2}$/.test(token) && parseInt(token, 10) === schemeCounter) {
        const schemeNumber = parseInt(token, 10);
        i++;

        // partNumber: первый токен после schemeNumber
        let partNumberRaw = tokens[i] || "";
        i++;

        // если следующий токен не русская буква и не следующий schemeNumber, добавляем его к partNumber
        while (
          i < tokens.length &&
          !/^[А-Яа-яЁё]/.test(tokens[i]) && // не русская
          !(parseInt(tokens[i], 10) === schemeCounter + 1) // не следующий schemeNumber
        ) {
          partNumberRaw += tokens[i];
          i++;
          if (partNumberRaw.length >= 30) break; // safety
        }
        const partNumber = partNumberRaw.replace(/\s+/g, "");
        if (!partNumber) continue;

        // descriptionRu: все токены с русскими буквами до первой латиницы/цифры
        let descRuTokens: string[] = [];
        while (i < tokens.length) {
          const tok = tokens[i];
          if (/^[A-Za-z0-9]/.test(tok)) break; // латиница/цифра → конец RU
          descRuTokens.push(tok);
          i++;
        }
        let descriptionRu = descRuTokens
          .join(" ")
          .replace(/\s{2,}/g, " ")
          .trim();

        // descriptionUk: все токены после RU до следующего schemeNumber
        let descUkTokens: string[] = [];
        while (i < tokens.length) {
          const tok = tokens[i];
          const nextNum = parseInt(tok, 10);
          if (!isNaN(nextNum) && nextNum === schemeCounter + 1) break; // следующий schemeNumber → конец текущего элемента
          descUkTokens.push(tok);
          i++;
        }

        // проверка на русские символы в UK: переносим их вместе с предшествующей латиницей в RU
        let j = 0;
        while (j < descUkTokens.length) {
          if (/[А-Яа-яЁё]/.test(descUkTokens[j])) {
            // переносим все токены до и включая текущий в RU
            const movedTokens = descUkTokens.splice(0, j + 1);
            descRuTokens.push(...movedTokens);
            descriptionRu = descRuTokens
              .join(" ")
              .replace(/\s{2,}/g, " ")
              .trim();
            j = 0; // начинаем снова с начала UK
          } else {
            j++;
          }
        }

        // quantity = последняя цифра в descUkTokens
        let quantity = 1;
        for (let k = descUkTokens.length - 1; k >= 0; k--) {
          const n = parseInt(descUkTokens[k], 10);
          if (!isNaN(n)) {
            quantity = n;
            descUkTokens.splice(k, 1); // удаляем цифру из UK
            break;
          }
        }

        // формируем descriptionUk
        let descriptionUk = descUkTokens
          .join(" ")
          .replace(/\s{2,}/g, " ")
          .trim();

        // исправление пробелов: убираем пробел, если после него нет заглавной буквы
        descriptionUk = descriptionUk.replace(/ (\S)/g, (_, ch) =>
          /^[A-Z]/.test(ch) ? ` ${ch}` : ch,
        );

        parsed.push({
          schemeNumber,
          partNumber,
          descriptionRu,
          descriptionUk,
          quantity,
          sourcePage: undefined,
        });

        schemeCounter++; // строго +1
      } else {
        i++;
      }
    }

    // console.log("Parsed parts:", parsed);
    return parsed;
  };

  return { parsePartsFromText };
};
