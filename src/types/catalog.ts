// пример структуры Part
export interface Part {
  id: string;
  schemeNumber: number | string;
  partNumber: string | number;
  descriptionRu: string;
  descriptionUk: string;
  quantity: number;
  sourcePage?: PdfPage; // вся информация о PDF
  alternatePartNumbers?: string[]; // взаимозаменяемые партийные номера
}

export interface Node {
  id: string;
  name: string;
  parts?: Part[];
  img?: string[];
  fromPdf?: boolean;

  // приватное поле для хранения страниц, с которых добавлены parts
  _pages?: PdfPage[];
}

export interface Aggregate {
  id: string;
  name: string;
  node: Node[];
  fromPdf: boolean;
  img?: string[];
}

export interface Model {
  id: string;
  name: string;
  agregates: Aggregate[];
}

export interface PdfPage {
  id: string;
  text: string;
  img: string;
  isImage?: boolean; // необязательный флаг
}
