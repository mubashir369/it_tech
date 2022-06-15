$(document).ready(function () {
    var t = $('#myTable').DataTable({
        columnDefs: [
            {
                searchable: false,
                orderable: false,
                targets: 0,
            },
        ],
        order: [[1, 'asc']],
    });
 
    t.on('order.dt search.dt', function () {
        let i = 1;
 
        t.cells(null, 0, { search: 'applied', order: 'applied' }).every(function (cell) {
            this.data(i++);
        });
    }).draw();
});

$(document).ready(function () {
    var t = $('#example').DataTable({
        columnDefs: [
            {
                searchable: false,
                orderable: false,
                targets: 0,
            },
        ],
        order: [[1, 'asc']],
    });
 
    t.on('order.dt search.dt', function () {
        let i = 1;
 
        t.cells(null, 0, { search: 'applied', order: 'applied' }).every(function (cell) {
            this.data(i++);
        });
    }).draw();
});
$(document).ready(function () {
    var t = $('#orders').DataTable({
        columnDefs: [
            {
                searchable: false,
                orderable: false,
                targets: 0,
            },
        ],
        order: [[1, 'asc']],
    });
 
    t.on('order.dt search.dt', function () {
        let i = 1;
 
        t.cells(null, 0, { search: 'applied', order: 'applied' }).every(function (cell) {
            this.data(i++);
        });
    }).draw();
});