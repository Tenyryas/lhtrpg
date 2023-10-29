const { fields } = foundry.data;

export function makeIntegerField(initial) {
  return makeNumberField({
    initial,
  });
}

export function makePositiveIntegerField(initial) {
  return makeNumberField({
    initial,
    positive: true,
  });
}

function makeNumberField({ initial = 0, positive = false }) {
  return new fields.NumberField({
    initial: initial,
    step: 1,
    required: true,
    nullable: false,
    positive: positive,
    integer: true,
  });
}

export function makeBooleanField(initial = false) {
  return new fields.BooleanField({ initial: initial });
}

export function makeArrayStringField() {
  return new fields.ArrayField(makeStringField());
}

export function makeStringField(initial = "") {
  return new fields.StringField({
    initial: initial,
    blank: !initial,
    nullable: false,
    trim: true,
  });
}

export function makeConditionField() {
  return new fields.ArrayField(
    new fields.SchemaField({
      condition: makeStringField(),
      rating: makePositiveIntegerField(),
    }),
  );
}

export function makeImageField(initial = "") {
  return new fields.FilePathField({
    initial: initial,
    categories: ["IMAGE"],
  });
}

export function makeHtmlField() {
  return new fields.HTMLField({
    nullable: false,
    blank: true,
  });
}

export function getCommonInfosField() {
  return {
    name: makeStringField("New Name"),
    rank: makePositiveIntegerField(1),
    tags: makeArrayStringField(),
    description: makeHtmlField(),
  };
}
