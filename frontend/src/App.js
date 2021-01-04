import logo from './logo.svg';
import './App.css';
import React from 'react'

class App extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			todoList:[],
			activeItem:{
				id:null,
				title:'',
				completed:false,
			},
			editing:false,
		}
		this.fetchTasks = this.fetchTasks.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.startEdit = this.startEdit.bind(this);
		this.strikeUnstrikeItem = this.strikeUnstrikeItem.bind(this);
		this.getCookie = this.getCookie.bind(this);
	}

	//csrf token from django documentation page
	getCookie(name) {
		let cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}


	//Fetch first when component is all mounted
	componentDidMount(){
		this.fetchTasks();
	}

	//Fetching all tasks
	fetchTasks(){
		console.log ('fetching...');

		fetch('http://127.0.0.1:8000/api/tasks-list/')
		.then(response => response.json())
		.then(data=> {
			console.log("data:", data);
			this.setState({
				todoList: data,
			})
		})
	}

	//Handle change in the input
	handleChange(e){
		var name = e.target.name;
		var value = e.target.value;
		this.setState({
			activeItem:{
				...this.state.activeItem,
				title: value,
			}
		})
	}

	//Handle submission in the input
	handleSubmit(e){
		e.preventDefault();
		var csrftoken = this.getCookie('csrftoken');
		var url = 'http://127.0.0.1:8000/api/task-create/';
		if (this.state.editing === true){
			url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}`;
		}
		fetch(url,{
			method: "POST",
			headers: {
				'Content-type': 'application/json',
				'X-CSRFToken': csrftoken,
			},
			body: JSON.stringify(this.state.activeItem)
		})
		.then(resp =>{
			this.fetchTasks();
			this.setState({
				activeItem:{
					id:null,
					title:'',
					completed:false,
				}
			})
		})
		.then(error=>{
			console.log(error);
		});
	}

	startEdit(task){
		this.setState({
			editing: true,
			activeItem:task,
		})
	}

	deleteItem(task){
		var url = `http://127.0.0.1:8000/api/task-delete/${task.id}`
		var csrftoken = this.getCookie('csrftoken');
		fetch(url, {
			method: "DELETE",
			headers:{
				'Content-type': 'application/json',
				'X-CSRFToken': csrftoken
			},
			body: task
		})
		.then(resp =>{
			this.fetchTasks();
			this.setState({
				activeItem:{
					id:null,
					title:'',
					completed:false,
				}
			})
		})
		.then(error=>{
				console.log(error);
		});
	}

	strikeUnstrikeItem(task){
		var url = `http://127.0.0.1:8000/api/task-update/${task.id}`;
		var csrftoken = this.getCookie('csrftoken');
		task.completed = !task.completed;
		console.log(task);
		fetch(url, {
			method:'POST',
			headers:{
				'Content-type': 'application/json',
				'X-CSRFToken': csrftoken,
			},
			body:JSON.stringify(task)
		})
		.then(response => {
			console.log(response);
			this.fetchTasks();
		})
	}

	render(){
		var tasks = this.state.todoList;
		var self = this;
		var tasksComponents = tasks.map(
			function(task, index){
				if (task.completed === true){
					var text = <strike>{task.title}</strike>;
				} else{
					var text = <span>{task.title}</span>;
				}
				return(
					<div key={index} className="task-wrapper flex-wrapper">
					<div onClick = {() => self.strikeUnstrikeItem(task)} style={{flex:7}}>
						{text}
					</div>
					<div style={{flex:1}}>
						<button onClick = {() => self.startEdit(task)} className="btn btn-sm btn-outline-info">edit</button>
					</div>
					<div style={{flex:1}}>
						<button onClick = {() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark">-</button>
					</div>
					</div>
				)
		})


		return(
			<div className="container">
				<div id = "task-container">
					<div id = "form-wrapper">
						<form onSubmit = {this.handleSubmit} id="form">
							<div className="flex-wrapper">
								<div style={{flex: 6}}>
									<input onChange={this.handleChange} className="form-control" id="title" type="text" name="title" value = {this.state.activeItem.title} placeholder="Add your task"></input>
								</div>
								<div style={{flex: 1}}>
									<input id="submit" className="btn btn-warning" type="submit" name="Add"></input>
								</div>
							</div>
						</form>
					</div>
					<div id = "list-wrapper">
						{tasksComponents}
					</div>
				</div>
			</div>
		)
	}
}

export default App;
