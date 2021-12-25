const form = document.querySelector('form'); // Get the form
form.addEventListener('submit',regUser); // Register user using an event listener

async function regUser(event)
{
    event.preventDefault(); // To prevent refreshing

    const name = document.getElementById('name').value; 
    const userName = document.getElementById('username').value; 
    const password = document.getElementById('password').value; 
    const dob = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value;
    const confirmPassword = document.getElementById('confirm').value;

    //Send data using JSON

    const result = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
            name,userName,confirmPassword,password,dob,phone
        })
    }).then(res => res.json());

    console.log(result);
}