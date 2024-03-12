/** @format */
const fs = require("fs");
const useDictionary = () => {
  // создание словаря для сериализации множества
  const array = [];
  for (let index = 36; index < 127; index++) {
    array.push(index);
  }

  const specSymbols = [];

  for (let index = 32; index < 36; index++) {
    specSymbols.push(index);
  }

  const str = new TextDecoder().decode(Uint8Array.from(array));

  const specString = new TextDecoder().decode(Uint8Array.from(specSymbols));

  const dict = {};

  let i = 1;

  while (Object.keys(dict).length < 300) {
    if (i < str.length + 1) {
      dict[i] = str[i - 1];
    } else {
      for (let j = 0; j < str.length; j++) {
        dict[Math.round((i - 91) * 91 + 0.5 + j)] = specString[i - 92] + str[j];
        if (Object.keys(dict).length === 300) break;
      }
    }
    i++;
  }
  return { specString, dict };
};

function getRandomFormRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const serializeSet = (set) => {
  return JSON.stringify([...set]);
};

const deserializeSet = (string) => {
  return new Set(JSON.parse(string));
};

const eqSet = (xs, ys) => {
  // функция проверки верного алгоритма десериализации
  return xs.size === ys.size && [...xs].every((x) => ys.has(x));
};

const runTest = ({
  title = "Serialization",
  amount = 1000,
  range = { min: 1, max: 300 },
}) => {
  const mySet = new Set();

  for (let index = 0; index < amount; index++) {
    mySet.add(getRandomFormRange(range.min, range.max));
  }

  const serialized = serializeSet(mySet);

  const { specString, dict } = useDictionary();

  const customSerializeSet = (set) => {
    // функция самой сериализации
    let serializedString = "";

    set.forEach((elem) => {
      const symbol = dict[String(elem)];
      serializedString += symbol;
    });
    return serializedString;
  };

  const serializedString = customSerializeSet(mySet);

  const customDeserializeSet = (string) => {
    // функция десериализации
    const stringArray = string.split("");

    const valuesArray = [];

    let flag = false;

    stringArray.map((value, index) => {
      if (flag) {
        flag = false;
      } else if (specString.includes(value)) {
        valuesArray.push(value + stringArray[index + 1]);
        flag = true;
      } else {
        valuesArray.push(value);
      }
    });

    const deserializedArray = [];

    valuesArray.map((value) => {
      const number = Number(
        Object.keys(dict).find((key) => dict[key] === value)
      );
      deserializedArray.push(number);
    });

    return new Set(deserializedArray);
  };

  const deserializedSet = customDeserializeSet(serializedString);

  const printData = () => {
    fs.writeFileSync(`common${title}.txt`, serialized, "ascii", {
      flags: "w+",
    });
    fs.writeFileSync(`ascii${title}.txt`, serializedString, "ascii", {
      flags: "w+",
    });
    console.log(
      `Исходный размер: ${serialized.length} байт, \nСжатый размер: ${
        serializedString.length
      } байт, \nСтепень сжатия: ${Math.round(
        (100 * (serialized.length - serializedString.length)) /
          serialized.length
      )}%`
    );
    console.log(
      `Тест: ${title}\n${
        eqSet(deserializedSet, mySet)
          ? "Исходное множество совпадает с десериализованным"
          : "исходное множество не совпадает с десериализованным"
      }\n\n`
    );
  };

  printData();
};

const testData = [
  { title: "50_any", amount: 50 },
  { title: "100_any", amount: 100 },
  { title: "500_any", amount: 500 },
  {
    title: "only_1_digit",
    range: {
      min: 1,
      max: 9,
    },
  },
  {
    title: "only_2_digit",
    range: {
      min: 10,
      max: 99,
    },
  },
  {
    title: "only_3_digit",
    range: {
      min: 100,
      max: 300,
    },
  },
  { title: "default" },
];

testData.map((test) => {
  //тестовые испытания
  runTest(test);
});
