document.getElementById('phone').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, ''); // 숫자만 추출

  let result = '';
  if (value.length < 4) {
    result = value;
  } else if (value.length < 8) {
    result = value.slice(0, 3) + '-' + value.slice(3);
  } else {
    result = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
  }

  e.target.value = result;
});

document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();  // <--- 이게 있어야 기본 GET 제출을 막음

  const form = e.target;
  const data = {
    student_number: form.student_number.value,
    email: form.email.value,
    password: form.password.value,
    name: form.name.value,
    phone: form.phone.value,
    department_id: Number(form.department_id.value),
    position: Number(form.position.value)
  };

  const res = await fetch('/api/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (res.ok) {
    alert('회원가입 성공!');
    location.href = '/';
  } else {
    alert('오류: ' + result.error);
  }
});
