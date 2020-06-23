# new-vue-virtual-table

## DOM

### Normal Mode

```pug
div.wrapper
  div.table
    div.table-container
      div.table-content
        table.table-body
          colgroup
          thead.table-thead
            tr
              th.table-cell
          tbody.table-tbody
            tr.table-row
              td.table-cell
```

### FixedHeader Mode

```pug
div.wrapper
  div.table
    div.table-container
      div.table-header[style="overflow: hidden;"]
        table[style="table-layout: fixed"]
          colgroup
          thead.table-thead
            tr
              th.table-cell
      div.table-body
        table[style="width: scroll.x; min-width: 100%; table-layout: fixed"]
          colgroup
          tbody.table-tbody
            tr.table-row
              td.table-cell
```
