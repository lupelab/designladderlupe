# Ajuste necesario en Apps Script para el módulo Plan de acción

La app ahora llama a estas acciones nuevas en el Apps Script:

- `createActionItem`
- `listActionItems`
- `getActionItem`
- `updateActionItem`

También necesita una nueva hoja llamada `action_items`.

## Headers de la hoja `action_items`

```js
const ACTION_SHEET_NAME = 'action_items';
const ACTION_HEADERS = [
  'id',
  'agency',
  'assessmentId',
  'dimension',
  'title',
  'description',
  'phase',
  'ownerName',
  'ownerEmail',
  'status',
  'priority',
  'impact',
  'effort',
  'dueDate',
  'nextReviewDate',
  'successMetric',
  'evidence',
  'comments',
  'source',
  'createdAt',
  'updatedAt',
  'raw_json'
];
```

## Rutas a agregar en `doPost`

Agregá estas condiciones después de `getTexoBenchmark`:

```js
if (action === 'createActionItem') {
  return handleCreateActionItem_(body);
}

if (action === 'listActionItems') {
  return handleListActionItems_(body);
}

if (action === 'getActionItem') {
  return handleGetActionItem_(body);
}

if (action === 'updateActionItem') {
  return handleUpdateActionItem_(body);
}
```

## Funciones nuevas para pegar al final del Apps Script

```js
function getActionSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ACTION_SHEET_NAME);

  if (!sh) {
    sh = ss.insertSheet(ACTION_SHEET_NAME);
  }

  ensureActionHeaders_(sh);
  return sh;
}

function ensureActionHeaders_(sh) {
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, ACTION_HEADERS.length).setValues([ACTION_HEADERS]);
    return;
  }

  const currentHeaders = sh
    .getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1))
    .getValues()[0]
    .map(String);

  const missingHeaders = ACTION_HEADERS.filter(function(header) {
    return currentHeaders.indexOf(header) === -1;
  });

  if (missingHeaders.length > 0) {
    sh.getRange(1, currentHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  }
}

function getActionHeaders_(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
}

function normalizeActionItem_(item) {
  return {
    id: String(item.id || ''),
    agency: String(item.agency || '').trim().toUpperCase(),
    assessmentId: String(item.assessmentId || ''),
    dimension: String(item.dimension || 'general'),
    title: String(item.title || ''),
    description: String(item.description || ''),
    phase: String(item.phase || 'Priorizar'),
    ownerName: String(item.ownerName || ''),
    ownerEmail: String(item.ownerEmail || ''),
    status: String(item.status || 'Pendiente'),
    priority: String(item.priority || 'Alta'),
    impact: String(item.impact || 'Alto'),
    effort: String(item.effort || 'Medio'),
    dueDate: String(item.dueDate || ''),
    nextReviewDate: String(item.nextReviewDate || ''),
    successMetric: String(item.successMetric || ''),
    evidence: String(item.evidence || ''),
    comments: String(item.comments || ''),
    source: String(item.source || 'Manual'),
    createdAt: String(item.createdAt || new Date().toISOString()),
    updatedAt: String(item.updatedAt || new Date().toISOString())
  };
}

function actionToRow_(headers, item) {
  const normalized = normalizeActionItem_(item);
  const rowObject = Object.assign({}, normalized, {
    raw_json: JSON.stringify(normalized)
  });

  return headers.map(function(header) {
    return rowObject[header] !== undefined ? rowObject[header] : '';
  });
}

function rowToActionObject_(headers, row) {
  const raw = rowToObject_(headers, row);
  const parsedRaw = parseJsonSafe_(raw.raw_json, {});
  return normalizeActionItem_(mergeObjects_(parsedRaw, raw));
}

function validateActionItem_(item) {
  if (!item || typeof item !== 'object') return 'Missing item';
  if (!item.id) return 'Missing id';
  if (!item.agency) return 'Missing agency';
  if (!ALLOWED_AGENCIES.includes(String(item.agency).trim().toUpperCase())) return 'Invalid agency';
  if (!item.title) return 'Missing title';
  return '';
}

function handleCreateActionItem_(body) {
  const item = normalizeActionItem_(body.item || body.actionItem || body.payload || body);
  const validationError = validateActionItem_(item);
  if (validationError) return json_({ ok: false, error: validationError });

  const sh = getActionSheet_();
  const headers = getActionHeaders_(sh);
  sh.appendRow(actionToRow_(headers, item));

  return json_({ ok: true, item: item });
}

function handleListActionItems_(body) {
  const agency = String(body.agency || '').trim().toUpperCase();
  if (!agency) return json_({ ok: false, error: 'Missing agency' });

  const sh = getActionSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return json_({ ok: true, items: [] });

  const headers = values[0].map(String);
  const rows = values.slice(1);
  const items = [];

  for (let i = rows.length - 1; i >= 0; i--) {
    const item = rowToActionObject_(headers, rows[i]);
    if (String(item.agency || '').trim().toUpperCase() === agency) items.push(item);
  }

  return json_({ ok: true, items: items });
}

function handleGetActionItem_(body) {
  const id = String(body.id || '').trim();
  if (!id) return json_({ ok: false, error: 'Missing id' });

  const sh = getActionSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return json_({ ok: true, item: null });

  const headers = values[0].map(String);
  const rows = values.slice(1);

  for (let i = rows.length - 1; i >= 0; i--) {
    const item = rowToActionObject_(headers, rows[i]);
    if (String(item.id) === id) return json_({ ok: true, item: item });
  }

  return json_({ ok: true, item: null });
}

function handleUpdateActionItem_(body) {
  const item = normalizeActionItem_(body.item || body.actionItem || body.payload || body);
  const validationError = validateActionItem_(item);
  if (validationError) return json_({ ok: false, error: validationError });

  const sh = getActionSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return json_({ ok: false, error: 'Action item not found' });

  const headers = values[0].map(String);
  const rows = values.slice(1);

  for (let i = 0; i < rows.length; i++) {
    const existing = rowToActionObject_(headers, rows[i]);
    if (String(existing.id) === String(item.id)) {
      sh.getRange(i + 2, 1, 1, headers.length).setValues([actionToRow_(headers, item)]);
      return json_({ ok: true, item: item });
    }
  }

  return json_({ ok: false, error: 'Action item not found' });
}
```

Después guardá y hacé una nueva implementación del Apps Script.
