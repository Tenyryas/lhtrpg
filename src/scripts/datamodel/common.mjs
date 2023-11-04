const { fields } = foundry.data;

export function prepareModelData(object) {
  object.skills = 0;
  object.items = 0;
  object.status = 0;
}

export function calculateTotal(stat) {
  const base = stat.base ?? 0;
  const bonus = stat.bonus ?? 0;
  const statClass = stat.class ?? 0;
  const race = stat.race ?? 0;
  const rank = stat.rank ?? 0;
  const skills = stat.skills ?? 0;
  const items = stat.items ?? 0;
  const status = stat.status ?? 0;
  stat.total = base + bonus + statClass + race + rank + skills + items + status;
}

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
