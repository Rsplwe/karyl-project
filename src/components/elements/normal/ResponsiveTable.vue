<template>
  <div>
    <table>
      <slot></slot>
    </table>
  </div>
</template>

<style>
table {
  border: 1px solid #ccc;
  width: 100%;
  margin: 0;
  padding: 0;
  border-collapse: collapse;
  border-spacing: 0;
}

table tr {
  border: 1px solid #ddd;
  padding: 5px;
}

table th,
table td {
  padding: 10px;
  text-align: center !important;
}

table th {
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 1px;
}

/* <= 568px */
@media screen and (max-width: 35.5em) {
  table {
    border: 0;
  }

  table thead {
    display: none;
  }

  table tr {
    margin-bottom: 10px;
    display: block;
    border-bottom: 2px solid #ddd;
  }

  table td {
    display: block;
    text-align: right;
    font-size: 13px;
    border-bottom: 1px dotted #ccc;
  }

  table td:last-child {
    border-bottom: 0;
  }

  table td:before {
    content: attr(data-label);
    float: left;
    text-transform: uppercase;
    font-weight: bold;
  }
}
</style>
