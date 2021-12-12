let tasks = [];
let current_task_name;
let current_task_date;
let current_task_priorities;
let current_task_priority;

function showTasks(connection) {//DBからタスクをとってきて表示
    let data;
    connection.query('SELECT * FROM tasks',(error, results, fields) => {
    if (error) throw error;
        data = results;
        if (data){
            for (d of data){
                insertTask(d.id,d.name,d.date,d.priority);
                tasks.push({id:d.id,name:d.name,date:d.date,priority:d.priority});
            }
        }
    });

}
function insertTask(id,name,date,priority){//タスクの挿入
    const tasks_wrapper_ele = document.querySelector('.new-tasks .tasks-wrapper');
    date = date.replace("T"," ");
    const element = `<div class="task task${id}"><p><span class="task-name">${name}</span><span class="task-date">${date}</span><span class="task-priority ${priority}">優先度:${priority}</span><span class="button"><button type="submit" class="move-prog-btn">進行中へ</button><button type="submit" class="move-done-btn">完了済みへ</button><button type="button" data-micromodal-trigger="modal-1" class="edit-task-btn">編集</button></span></p></div>`
    tasks_wrapper_ele.insertAdjacentHTML("beforeend",element);
    addMoveBtnEvent(document.querySelector(`.task${id} .move-prog-btn`),"prog");//ボタンのイベント紐付け
    addMoveBtnEvent(document.querySelector(`.task${id} .move-done-btn`),"done");
    MicroModal.init({
        disableScroll: true,
        awaitOpenAnimation: true,
        awaitCloseAnimation: true,
        onClose: modal => closeModal(),
    });
    document.querySelector(`.task${id} .edit-task-btn`).addEventListener('click',(event) =>{
        showModal(event);
    },false);
}
function addTask(connection,event){//タスク追加が押されたら
    const task_id = tasks.length+1;
    let task_name = event.path[3].querySelector('.task-name').value;
    let task_date = event.path[3].querySelector('.task-date').value;
    let task_priorities = event.path[3].querySelectorAll('.priority');
    let task_priority;
    for(p of task_priorities){
        if(p.checked){
            task_priority = p.value;
        }
    }

    connection.query(`INSERT INTO tasks(name,date,priority) values("${task_name}","${task_date}","${task_priority}")`,(error) => {
        if(error) throw error;
        tasks.push({id:task_id,name:task_name.name,date:task_date,priority:task_priority});
        insertTask(task_id,task_name,task_date,task_priority);
    });
    
}
function addMoveBtnEvent(btn_ele,dire){//ボタンにイベントの登録
    btn_ele.addEventListener('click',(event) =>{
        moveTask(event,dire);
    },false);
}
function moveTask(event,dire){//タスクの移動　direは移動先
    const move_new_btn_ele = '<button type="submit" class="move-new-btn">未着手へ</button>'
    const move_prog_btn_ele = '<button type="submit" class="move-prog-btn">進行中へ</button>'
    const move_done_btn_ele = '<button type="submit" class="move-done-btn">完了済みへ</button>'
    const task_ele = event.path[3];//domツリーごとクローン
    const button_span_ele = task_ele.querySelector("span.button");
    let btn;

    document.querySelector(`.${dire}-tasks > .tasks-wrapper`).appendChild(task_ele);//クローンを移動先に追加
    if(task_ele.querySelector(`span.button > .move-${dire}-btn`)){
        task_ele.querySelector(`span.button > .move-${dire}-btn`).remove();//direとかぶってるボタンは削除

    }

    switch(dire){
        case "new":
            if(!button_span_ele.querySelector("span.button > .move-prog-btn")){//progボタンがない場合
                button_span_ele.insertAdjacentHTML("beforeend",move_prog_btn_ele);
                btn = button_span_ele.querySelector("span.button > .move-prog-btn");
                addMoveBtnEvent(btn,"prog");//ボタン追加したらイベントの登録しなおし

            }
            if(!button_span_ele.querySelector("span.button > .move-done-btn")){//doneボタンがない場合
                button_span_ele.insertAdjacentHTML("beforeend",move_done_btn_ele);
                btn = button_span_ele.querySelector("span.button > .move-done-btn");
                addMoveBtnEvent(btn,"done");
            }       
            break;
        case "prog":
            if(!button_span_ele.querySelector("span.button > .move-new-btn")){//newボタンがない場合
                button_span_ele.insertAdjacentHTML("beforeend",move_new_btn_ele);
                btn = button_span_ele.querySelector("span.button > .move-new-btn");
                addMoveBtnEvent(btn,"new");
            }
            if(!button_span_ele.querySelector("span.button > .move-done-btn")){//doneボタンがない場合
                button_span_ele.insertAdjacentHTML("beforeend",move_done_btn_ele);
                btn = button_span_ele.querySelector("span.button > .move-done-btn");
                addMoveBtnEvent(btn,"done");
            }
            break;
        case "done":
            if(!button_span_ele.querySelector("span.button > .move-new-btn")){//newボタンがない場合
                button_span_ele.insertAdjacentHTML("beforeend",move_new_btn_ele);
                btn = button_span_ele.querySelector("span.button > .move-new-btn");
                addMoveBtnEvent(btn,"new");
            }
            if(!button_span_ele.querySelector("span.button > .move-prog-btn")){//progボタンがない場合
                button_span_ele.insertAdjacentHTML("beforeend",move_prog_btn_ele);
                btn = button_span_ele.querySelector("span.button > .move-prog-btn");
                addMoveBtnEvent(btn,"prog");
            }
            break;
    }
}
function showModal(event){//モーダルウィンドウを開いたとき
    current_task_name = event.path[3].querySelector(".task-name").innerHTML;
    current_task_date = event.path[3].querySelector(".task-date").innerHTML;
    current_task_priority = event.path[3].querySelector(".task-priority").className;
    document.querySelector(".edit-task .task-name").value = current_task_name;
    document.querySelector(".edit-task .task-date").value = current_task_date.replace(" ","T");
    current_task_priority = current_task_priority.replace("優先度:","").replace("task-priority ","");
    document.querySelector(`.edit-task .${current_task_priority}`).checked = true;
}
function closeModal(){
    //モーダルウィンドウを開いたときに登録したイベントを破棄
    //document.querySelector(".update-task-btn").removeEventListener('click',updateTask());
}
function updateTask(event,connection){
    let task_name = event.path[3].querySelector(".task-name").value;
    let task_date = event.path[3].querySelector(".task-date").value;
    let task_priorities = event.path[3].querySelectorAll(".priority");
    let task_priority;
    for(p of task_priorities){
        if(p.checked){
            task_priority = p.value;
        }
    }
    let target_eles = document.querySelectorAll(".task-date");//あんましよくない idで判別すべき
    let target_ele;
    for(t of target_eles){
        if(t.innerHTML.replace(" ","T") == current_task_date.replace(" ","T")){
            target_ele = t.parentNode;
        }
    }
    console.log(task_date)
    console.log(target_ele.querySelector(".task-date").innerHTML.replace(" ","T"))
    connection.query(`update tasks set name="${task_name}",date="${task_date}",priority="${task_priority}" where date="${target_ele.querySelector(".task-date").innerHTML.replace(" ","T")}";`,(error) => {
        if(error) throw error;
    });
    target_ele.querySelector(".task-name").innerHTML = task_name;
    target_ele.querySelector(".task-date").innerHTML = task_date;
    target_ele.querySelector(".task-priority").innerHTML = `優先度:${task_priority}`;
    MicroModal.close('modal-1');
}
function deleteTask(){
    let target_eles = document.querySelectorAll(".task-date");//あんましよくない idで判別すべき
    let target_ele;
    for(t of target_eles){
        if(t.innerHTML.replace(" ","T") == current_task_date.replace(" ","T")){
            target_ele = t.parentNode;
        }
    }
    connection.query(`delete from tasks where ${target_ele.querySelector(".task-date").innerHTML.replace(" ","T")}`,(error) => {
        if(error) throw error;
    });

}

window.addEventListener("DOMContentLoaded", () => {
    const mysql2 = require("mysql2");
    //requireできない版
    //window.requires.mysql2
    const add_btn_ele = document.querySelector('.add-btn');//タスク追加ボタン
    const move_new_btn_eles = document.querySelectorAll('.move-new-btn');//タスクを未着手に移動ボタン
    const move_prog_btn_eles = document.querySelectorAll('.move-prog-btn');//タスクを進行中に移動ボタン
    const move_done_btn_eles = document.querySelectorAll('.move-done-btn');//タスクを完了済みに移動ボタン
    const edit_task_btn_eles = document.querySelectorAll('.edit-task-btn');//タスク編集ボタン
    const update_task_btn_ele = document.querySelector(".update-task-btn");
    console.log(update_task_btn_ele)
    const delete_task_btn_ele = document.querySelector(".delete-task-btn");

    const connection = mysql2.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'd9mb67cy',
        database: 'todo'
    });
    connection.connect();

    showTasks(connection);

    //タスク追加ボタンイベント
    add_btn_ele.addEventListener('click', (event) => {
        addTask(connection,event);
    }, false);
    // タスク移動ボタンイベント 各ボタンにそれぞれ紐付ける
    for(move_new_btn_ele of move_new_btn_eles){
        move_new_btn_ele.addEventListener('click',(event) =>{
            moveTask(event,"new");
        },false);
    }
    for(move_prog_btn_ele of move_prog_btn_eles){
        move_prog_btn_ele.addEventListener('click',(event) =>{
            moveTask(event,"prog");
        },false);
    }
    for(move_done_btn_ele of move_done_btn_eles){
        move_done_btn_ele.addEventListener('click',(event) =>{
            moveTask(event,"done");
        },false);
    }
    //タスク編集ボタンイベント
    for(edit_task_btn_ele of edit_task_btn_eles){
        edit_task_btn_ele.addEventListener('click',(event) =>{
            showModal(event);
        },false);
    }
    update_task_btn_ele.addEventListener('click',(event) =>{
        updateTask(event,connection);
    },false);
    delete_task_btn_ele.addEventListener('click',(event) =>{
        deleteTask(event,connection);
    },false);
});