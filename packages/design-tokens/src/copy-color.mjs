const from = 'green';
const to = 'success';

const result = {};
result[to] = {};
result[to]['@'] = {
  $value: '{color.' + from + '.@}',
};
[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100].map(weight => {
  result[to][weight] = {
    $value: '{color.' + from + '.' + weight + '}',
  };
});

console.log(JSON.stringify(result, null, 2));
