var container = document.getElementById('map'); // 지도를 담을 영역의 DOM 레퍼런스
var options = { // 지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표.
    level: 3 // 지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴
var geocoder = new kakao.maps.services.Geocoder();
// 전역 변수 선언
var polyline= null;
var distance = null;
var duration = null;
var selectedDepartureTime = null; // 사용자가 선택한 출발 예정 시간을 저장할 변수
var startAddress = null;
var destinationAddress = null;
var startMarker= null;
var destinationMarker= null;

var distanceList = []; // 거리를 저장할 리스트
var predictedTime = 0; // 전체 예측 시간을 저장할 변수
var k = 0;

var totalDistanceRoot1 = 0;
var totalTimeRoot1 = 0;
var totalDistanceRoot2 = 0;
var totalTimeRoot2 = 0;

var root1_highwayNodes = [
    [127.22031199549663,37.52381114479651], //0300
    [127.24098253938524,37.4842955984355],
    [127.25374529878387,37.465931869766976],
    [127.26317194991778,37.45201993175246],
    [127.27938707326331,37.4451845824706],
    [127.3037457517851,37.41304840725884],
    [127.3153660401467,37.386699251295425],
    [127.3235283049389,37.346852000680954],
    [127.32537388142184,37.341697575159905],
    [127.34740718560963,37.31515596805733],

    [127.37471602201036,37.29412593065992],
    [127.39848711354917,37.27111247899416],
    [127.41987824596501,37.25030630765819],
    [127.43228336236245,37.21979076768787],
    [127.44276715850832,37.19452191600411],
    [127.44528074122488,37.10951014878058],
    [127.47493219534448,37.05570119062435],
    [127.47843298234658,37.001719008085665],
    [127.4669047573043,36.971587500531335],
    [127.474900100258,36.93254850659951],

    [127.47591573344967,36.89574803386027],
    [127.47905463319294,36.86141333965102],
    [127.49265031625535,36.828953862302306],
    [127.50766968194922,36.78987979374164],
    [127.44540352419638,36.718645828453454],

    [127.42458377120629,36.67464859084522],
    [127.4200886458462,36.60520675877221],//중부선 끝

    // //경부
    [127.43210220588804,36.55363043485985],
    [127.42794983703914,36.471908653925546],
    [127.41870756182243,36.39700720499854]
];


var root2_highwayNodes = [
    [127.10332041039379, 37.358794072637785], //2200
    [127.1034515341123,37.33356568720989],
    [127.10371825319847,37.282207568764164],
    [127.10378839595677, 37.268692199713435],
    [127.10381177258138, 37.26418706952283],
    [127.10000025955983, 37.220871613416406],
    [127.09583359115491, 37.21257018267256],
    [127.09606378065385, 37.18069128191127],
    [127.09095628389771, 37.16515618993971],

    [127.0849166721204, 37.141197247014425],
    [127.1192174917301, 37.09957860692084],
    [127.1303810262686 ,37.076033172993704],
    [127.1453124272744, 37.01470955711591],
    [127.15417441331587, 36.99434172233534],
    [127.15925352834235, 36.98342187402131],
    [127.18826863839793, 36.877147179016006],
    [127.16620375354104, 36.8193716654845],
    [127.1666213807959, 36.79974216728726],
    [127.19023650476807, 36.76697529740176],

    [127.2309875538001, 36.745043810570984],
    [127.38303029780384, 36.627080729093386],
    [127.4305295251844, 36.56516799699589],
    [127.43210220588804, 36.55363043485985],

    [127.43020967328724, 36.532986405455695],
    [127.42923867327536, 36.51398873766687],
    [127.42794983703914, 36.471908653925546],
    [127.4197184682824, 36.43852029408191],
    [127.41731976383807, 36.429692944186755],
    [127.41870756182243, 36.39700720499854]
];
async function drawRouteKakaoWayPoint(origin, waypoint, destination, apiKey, bool, root) {
    console.log("origin = " + origin)
    const REST_API_KEY = apiKey;

    const headers = {
        Authorization: `KakaoAK ${REST_API_KEY}`,
        'Content-Type': 'application/json'
    };

    let w = null;
    if(waypoint != null){
        w = waypoint.map((waypoint) => ({
            "x": String(waypoint[0]),
            "y": String(waypoint[1])
        }));
    }



    originX = String(origin[0]);
    originY = String(origin[1]);
    destinationX = String(destination[0]);
    destinationY = String(destination[1]);

    //
    // console.log("origin : " + origin);
    console.log("w! : ", JSON.stringify(w));
    // console.log("w.len" + w.length);
    // console.log("des : " + destination);

    let  data ;
    if(w != null){
        data =  {
            "origin": {
                "x": originX,
                "y": originY
            },
            "destination": {
                "x": destinationX,
                "y": destinationY
            },
            "waypoints" : w,
            "priority" : "TIME",
            "traffic" : true,
            "roadevent": 2,
            "optimizeWaypoints": true,
        //    "travelMode": 'TRANSIT'

        };
    }
    else{
        data =  {
            "origin": {

                "x": originX,
                "y": originY
            },
            "destination": {
                "x": destinationX,
                "y": destinationY
            },
            "priority" : "RECOMMEND",
            "traffic" : true,
            "avoid" : ["motorway"],
            "roadevent": 2
        };
    }


    try {
        const response = await $.ajax({
            type: 'post',
            url: "https://apis-navi.kakaomobility.com/v1/waypoints/directions",
            data: JSON.stringify(data),
            headers: headers,
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                console.log('통신 성공');
                console.log(response);

                const sections = response.routes[0].sections;
                const numSections = sections.length;

                for (let i = 0; i < numSections; i++) {
                    const tmp = response.routes[0].sections[i].distance;
                    distanceList[k] = tmp;
                    k++;
                    console.log("k==" + k);
                    console.log("tmp == " + tmp);
                }


                console.log("predictedTime : " + predictedTime);
                for (let j = 0; j < k; j++) {
                    console.log("distance [" + j + "]: " + distanceList[j]);
                }
                if(bool){
                    drawRoute(response);
                }
                else{
                    let totalDistance = 0;
                    for (let j = 0; j < k; j++) {
                        totalDistance += distanceList[j];
                        console.log("distance [" + j + "]: " + distanceList[j]);
                    }
                    if(root == 1){
                        totalDistanceRoot1 = totalDistance;

                    }
                    else if(root == 2 ){
                        totalDistanceRoot2 = totalDistance;
                    }
                }
            },
            error: function (xhr, status, error) {
                console.log('통신 실패');
                console.error(error);
            }
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

async function drawRoute(response){
    // 경로 표시
    const linePath = [];
    response.routes[0].sections.forEach(section => {
        section.roads.forEach(router => {
            router.vertexes.forEach((vertex, index) => {
                if (index % 2 === 0) {
                    linePath.push(new kakao.maps.LatLng(router.vertexes[index + 1], router.vertexes[index]));
                }
            });
        });
    });

    polyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#000000',
        strokeOpacity: 0.7,
        strokeStyle: 'solid'
    });
    polyline.setMap(map);
}

// 주어진 경로들을 순회하면서 각각의 경로를 지도에 그림
async function drawRoutesWayPoint(waypoints, apikey, bool, root) {
    await drawRouteKakaoWayPoint(waypoints[0], waypoints[1], waypoints[2], apikey, bool, root);
}

document.getElementById("toggle-button").addEventListener("click", function () {

    document.getElementById('search-container').classList.toggle('toggle-open');
    document.getElementById('search-container').classList.toggle('toggle-closed');

    document.getElementById('btn-shortest-distance').style.display = 'none';
    document.getElementById('btn-shortest-time').style.display = 'none';
    // 토글 창이 열릴 때 출발지 및 도착지 입력란에 즉각적으로 자동 완성 기능 활성화
    if (document.getElementById('search-container').classList.contains('toggle-open')) {
        const startInput = document.getElementById('start-input-small');
        const destinationInput = document.getElementById('destination-input-small');

        const startSuggestionsContainer = document.getElementById('start-suggestions');
        const destinationSuggestionsContainer = document.getElementById('destination-suggestions');


        showSuggestions(startInput, startSuggestionsContainer);
        showSuggestions(destinationInput, destinationSuggestionsContainer);
        startSuggestionsContainer.innerHTML = '';
        destinationSuggestionsContainer.innerHTML = '';
    }
});

document.addEventListener("DOMContentLoaded", function() {
    var searchContainer = document.getElementById("search-container");
    var toggleButton = document.getElementById("toggle-button");
    var closeButton = document.getElementById("close-button");
    // 검색창 표시 상태를 추적하는 변수
    var isSearchContainerVisible = false;

    // 토글 버튼 클릭 이벤트 리스너
    toggleButton.addEventListener("click", function() {
        // 검색창의 표시 상태를 토글
        isSearchContainerVisible = !isSearchContainerVisible;

        if (isSearchContainerVisible) {
            // 검색창을 보이게 하고 버튼 텍스트를 변경
            searchContainer.style.display = "block";
            toggleButton.style.display = "none";
            closeButton.style.display = "block";
        }
    });
    closeButton.addEventListener("click", function() {
        // 검색 창을 숨기고 토글 버튼은 다시 보이게 하고 닫기 버튼은 숨김
        searchContainer.style.display = "none";
        toggleButton.style.display = "block";
        closeButton.style.display = "none";
        isSearchContainerVisible = false; // 상태 업데이트
    });

    searchContainer.style.display = "none";
    toggleButton.style.display = "block"; // 초기에 토글 버튼만 표시
    closeButton.style.display = "none"; // 초기에 닫기 버튼은 숨김

});

// 작은 창에서 출발지와 도착지 주소를 가져와 해당 위치에 마커를 추가합니다.
document.getElementById("search-form-small").addEventListener("submit", async function (event) {
    event.preventDefault();
    var apiKey = document.body.getAttribute('data-api-key');
    try {

        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startAddress: startAddress,
                destinationAddress: destinationAddress
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const startCoords = data.startCoords; // 출발지 좌표
        const destinationCoords = data.destinationCoords; // 도착지 좌표
        selectedDepartureTime = getSelectedDepartureTime(); // 사용자가 선택한 출발 예정 시간 가져오기

        await calculateTimeAndDistance(startCoords, destinationCoords, apiKey, root1_highwayNodes, 1);
        distanceList = [];
        k=0;

        await calculateTimeAndDistance(startCoords, destinationCoords, apiKey, root2_highwayNodes, 2);

        const time = 130;
        document.getElementById('root1-time-info').innerText = time + ' 분';
        document.getElementById('root1-distance-info').innerText = totalDistanceRoot1/1000 + ' km'; // 거리 정보 업데이트
        document.getElementById('root2-time-info').innerText = 150 + ' 분';
        document.getElementById('root2-distance-info').innerText = totalDistanceRoot2/1000 + ' km'; // 거리 정보 업데이트

        document.getElementById('start-suggestions').style.display = 'none';
        document.getElementById('destination-suggestions').style.display = 'none';
        document.getElementById('btn-shortest-distance').style.display = 'block';
        document.getElementById('btn-shortest-time').style.display = 'block';
        // 최단 시간 버튼 클릭 시 이벤트 리스너
        document.getElementById("btn-shortest-time").addEventListener("click", async function () {
            drawRoutesByType('time', startCoords, destinationCoords, apiKey, root1_highwayNodes);
        });

        // 최단 거리 버튼 클릭 시 이벤트 리스너
        document.getElementById("btn-shortest-distance").addEventListener("click", async function () {
            drawRoutesByType('distance', startCoords, destinationCoords, apiKey, root2_highwayNodes);
        });



    } catch (error) {
        console.error("Error:", error);
        alert('경로 표시 중 오류가 발생했습니다.');
    }
});
// 서버로부터 좌표 데이터를 가져와서 g_highwayNodes에 할당
async function fetchCoordinatesFromServer() {
    try {
        const response = await fetch('/path-prediction');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const coordinates = await response.json();
        return coordinates;
    } catch (error) {
        console.error("Error fetching coordinates from server:", error);
        return null;
    }
}

// 검색창에 입력이 들어올 때마다 자동 완성을 표시하는 함수
function showSuggestions(input, suggestionsContainer, isStart) {

    // 검색창의 값 가져오기
    const inputValue = input.value;

    // 검색어가 없으면 자동 완성 목록을 숨김
    if (!inputValue) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    // 서버에 자동 완성에 필요한 데이터를 요청
    fetch(`/api/suggestions?query=${inputValue}`)
        .then(response => response.json())
        .then(data => {
            showPlaceList(data, isStart);
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
            suggestionsContainer.innerHTML = '';
        });



}
// 출발지 검색창에 입력이 들어올 때마다 자동 완성 기능 활성화
document.getElementById('start-input-small').addEventListener('input', function () {
    const suggestionsContainer = document.getElementById('start-suggestions');
    const  isStart = true;
    showSuggestions(this, suggestionsContainer, isStart);
});

// 도착지 검색창에 입력이 들어올 때마다 자동 완성 기능 활성화
document.getElementById('destination-input-small').addEventListener('input', function () {
    const suggestionsContainer = document.getElementById('destination-suggestions');
    const  isStart = false;

    showSuggestions(this, suggestionsContainer, isStart);

});
function resetSearch() {
    // 출발지 및 도착지 입력란 비우기
    var startCoords = null;
    var destinationCoords = null;
    var startAddress = null;
    var destinationAddress = null;

    // 이전에 추가된 마커 및 경로 제거
    if (startMarker) {
        startMarker.setMap(null); // 출발지 마커 제거
    }
    if (destinationMarker) {
        destinationMarker.setMap(null); // 도착지 마커 제거
    }
    if (polyline) {
        polyline.setMap(null); // 경로 제거
    }
    distance = null;
    duration = null;

    distanceList = [];
    predictedTime = 0;
}


// 사용자가 선택한 출발 예정 시간을 다른 함수에서 사용할 수 있도록 반환하는 함수
function getSelectedDepartureTime() {
    let currentDateTimeString;
    if (!selectedDepartureTime) {
        // 선택한 출발 예정 시간이 없는 경우 현재 시간을 YYYYMMDDHHMM 형식으로 반환합니다.
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + currentDate.getDate()).slice(-2);
        const hours = ('0' + currentDate.getHours()).slice(-2);
        const minutes = ('0' + currentDate.getMinutes()).slice(-2);

        console.log("hours : " + hours)
        console.log("currentDate: " + currentDate);
        if (hours > 12) {
            currentDateTimeString = year + "년 " + month + "월 " + day + "일 오후 " + (hours - 12) + "시 " + minutes + "분 출발";
        } else if (hours === 12) {
            currentDateTimeString = year + "년 " + month + "월 " + day + "일 오후 " + hours + "시 " + minutes + "분 출발";
        } else if (hours === 0) {
            currentDateTimeString = year + "년 " + month + "월 " + day + "일 오전 12시 " + minutes + "분 출발";
        } else {
            currentDateTimeString = year + "년 " + month + "월 " + day + "일 오전 " + hours + "시 " + minutes + "분 출발";
        }
        //    document.getElementById("departure-time").value = currentDateTimeString;

        console.log("currentDateTimeString :" + currentDateTimeString);
        return `${year}${month}${day}${hours}${minutes}`;
    } else {
        return selectedDepartureTime;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // 현재 시간을 가져와서 표시
    var currentDate = new Date();
    console.log("currentDate : " + currentDate);
    var year = currentDate.getFullYear();
    var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    var day = ('0' + currentDate.getDate()).slice(-2);
    var hours = ('0' + currentDate.getHours()).slice(-2);
    var minutes = ('0' + currentDate.getMinutes()).slice(-2);
    var ampm = currentDate.getHours() < 12 ? "오전" : "오후";
    console.log("currentDate: " + currentDate);
    console.log("hours : " + hours)

    var currentDateTimeString
    if (hours > 12) {
        currentDateTimeString = year + "년 " + month + "월 " + day + "일 오후 " + (hours - 12) + "시 " + minutes + "분 출발";
    } else if (hours === 12) {
        currentDateTimeString = year + "년 " + month + "월 " + day + "일 오후 " + hours + "시 " + minutes + "분 출발";
    } else if (hours === 0) {
        currentDateTimeString = year + "년 " + month + "월 " + day + "일 오전 12시 " + minutes + "분 출발";
    } else {
        currentDateTimeString = year + "년 " + month + "월 " + day + "일 오전 " + hours + "시 " + minutes + "분 출발";
    }
    console.log("currentDateTimeString :" + currentDateTimeString );

    flatpickr("#departure-time", {
        enableTime: true,
        minDate: "today", // 현재 날짜 이전 선택 불가능
        dateFormat: "Y년 n월 j일 H시 i분 출발", // 날짜 및 시간 표시 형식 설정
        defaultDate: currentDate, // 현재 시간을 default 값으로 설정
        time_24hr: false,
        onClose: function(selectedDates, dateStr, instance) {
            // 사용자가 시간을 선택한 후 실행되는 콜백 함수
            const selectedTime = instance.latestSelectedDateObj;
            const currentTime = new Date();
            console.log("selectedTime : " + selectedTime);
            if (selectedTime < currentTime) {
                // 선택한 시간이 현재 시간보다 이전인 경우 경고 메시지 표시
                alert("과거 시간은 선택할 수 없습니다.");
                instance.setDate(currentTime); // 현재 시간으로 재설정
            }
            else
            {
                const hours = selectedTime.getHours();
                const ampm = hours >= 12 ? "오후" : "오전";
                const formattedHours = hours % 12 || 12; // 12시간 형식으로 변환
                selectedDepartureTime = `${selectedTime.getFullYear()}년 ${selectedTime.getMonth() + 1}월 ${selectedTime.getDate()}일 ${ampm} ${formattedHours}시 ${selectedTime.getMinutes()}분 출발`;
                console.log("selectedDepartureTime2: " + selectedDepartureTime);
            }
        }

    })
});

// 서버로부터 받은 장소 정보를 표시하는 함수
function displayPlaceInfo(placeName, address, isStart) {
    const placeListContainer = document.getElementById('place-list');
    // 장소 정보를 담을 박스 생성
    const placeInfoBox = document.createElement('div');
    placeInfoBox.classList.add('place-info-box');

    // 장소 이름과 주소를 박스에 추가
    placeInfoBox.innerHTML = `
        <strong>${placeName}</strong><br>
        ${address}
    `;

    // 클릭 이벤트 핸들러 함수
    placeInfoBox.addEventListener('click', function() {
        // 클릭 이벤트가 발생하면 이전의 장소 정보를 삭제
        placeListContainer.innerHTML = '';

        const placeName = this.querySelector('strong').textContent; // 해당 위치의 주소값을 가져옵니다.
        console.log("Clicked placeName: " + placeName);
        const addressElement = this.querySelector('br').nextSibling; // 주소를 포함하는 요소를 선택합니다.
        const address = addressElement.textContent.trim(); // 해당 위치의 주소를 가져옵니다.
        console.log("Clicked address: " + address);

        // 클릭한 주소를 입력란에 넣기
        if (isStart) {
            document.getElementById('start-input-small').value = placeName; // 출발지 입력란에 클릭한 주소 이름을 넣습니다.
            startAddress = address;
        } else {
            document.getElementById('destination-input-small').value = placeName; // 도착지 입력란에 클릭한 주소 이름을 넣습니다.
            destinationAddress = address;
        }
    });

    // 생성된 박스를 장소 목록 컨테이너에 추가
    placeListContainer.appendChild(placeInfoBox);

}


// 서버로부터 받은 데이터를 가지고 장소 정보 표시
function showPlaceList(data, isStart) {
    const placeListContainer = document.getElementById('place-list');
    placeListContainer.innerHTML = ''; // 기존 내용 비우기
    for (const placeName in data) {
        if (data.hasOwnProperty(placeName)) {
            const address = data[placeName];
            displayPlaceInfo(placeName, address, isStart);
        }
    }
}
// 출발지와 도착지에 마커를 추가하고 해당 위치를 지도 중심으로 설정하는 함수
function addMarkersAndSetCenter(startCoords, destinationCoords) {
    // 출발지와 도착지 좌표를 LatLng 객체로 변환
    const startLatLng = new kakao.maps.LatLng(startCoords.y, startCoords.x);
    const destinationLatLng = new kakao.maps.LatLng(destinationCoords.y, destinationCoords.x);

    console.log("startLatLng" + startLatLng);
    console.log("destinationLatLng" + destinationLatLng);

    // 출발지와 도착지 마커 생성
    const startMarker = new kakao.maps.Marker({
        map: map,
        position: startLatLng,
        title: '출발지'
    });
    const destinationMarker = new kakao.maps.Marker({
        map: map,
        position: destinationLatLng,
        title: '도착지'
    });

    // 출발지와 도착지 마커를 배열로 저장
    const markers = [startMarker, destinationMarker];

    // 출발지와 도착지 마커를 모두 표시하는 범위를 구합니다.
    const bounds = new kakao.maps.LatLngBounds();

    // 출발지와 도착지 마커를 모두 포함하도록 bounds에 추가
    for (const marker of markers) {
        bounds.extend(marker.getPosition());
    }

    // 출발지와 도착지 마커가 모두 보이도록 지도의 중심과 확대 수준을 설정합니다.
    map.setBounds(bounds);
}
async function sendDepartureTimeToFastAPI(startCoords, destinationCoords, distance, selectedDepartureTime) {
    try {

        const url = '/api/info'; // Spring Controller의 엔드포인트 URL

        const data = {
            startCoords: startCoords,
            destinationCoords: destinationCoords,
            distance: distance,
            departureTime: selectedDepartureTime
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Response from FastAPI:', responseData);
        } else {
            console.error('Failed to send info to FastAPI. Status code:', response.status);
            const errorData = await response.text();
            console.error('Error message:', errorData);
        }
    } catch (error) {
        console.error('Error sending departure time to FastAPI:', error);
    }
}

async function sendDistanceToServer(distanceList) {
    console.log("distanceList : " + distanceList);
    try {
        console.log("distanceList : "+distanceList.length);
        const response = await fetch('/api/distanceList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(distanceList)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Response from server:', responseData);
    } catch (error) {
        console.error('Error sending distance to server:', error);
    }
}

async function sendPredictedTimeToServer(predictedTime) {
    console.log("predictedTime : " + predictedTime);
    try {
        const response = await fetch('/api/predictedTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(predictedTime)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Response from server:', responseData);
    } catch (error) {
        console.error('Error sending distance to server:', error);
    }
}

// 클릭된 위치의 좌표를 주소로 변환하여 출력하는 함수
function displayAddressFromCoords(mouseEvent) {
    const latlng = mouseEvent.latLng;

    // 좌표를 주소로 변환하는 함수 호출
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name;
            console.log('Clicked location - Address: ' + address);
            console.log('Clicked location - Latitude: ' + latlng.getLat() + ', Longitude: ' + latlng.getLng());
        } else {
            console.error('Failed to convert coordinates to address');
        }
    });
}

// 지도 클릭 이벤트 핸들러 추가
kakao.maps.event.addListener(map, 'click', displayAddressFromCoords);


const markers = [];

function addMarkers(highwayNodes) {
    for (const coords of highwayNodes) {
        // 좌표를 LatLng 객체로 변환
        const LatLng = new kakao.maps.LatLng(coords[1], coords[0]);

        // 마커 생성
        const marker = new kakao.maps.Marker({
            map: map,
            position: LatLng,
            title: '위치'
        });

        // 마커를 배열에 추가
        markers.push(marker);
    }

    // 모든 마커를 포함하는 범위를 구합니다.
    const bounds = new kakao.maps.LatLngBounds();
    for (const marker of markers) {
        bounds.extend(marker.getPosition());
    }
}

async function calculateTimeAndDistance(startCoords, destinationCoords, apiKey, highwayNodes, root){
    const origin = `${startCoords.x},${startCoords.y}`;
    const destination = `${destinationCoords.x},${destinationCoords.y}`;

    const waypoints = [];
    waypoints.push([startCoords.x, startCoords.y]);
    waypoints.push(highwayNodes);
    waypoints.push([destinationCoords.x, destinationCoords.y]);

    await drawRoutesWayPoint(waypoints, apiKey, false, root);
}
async function drawRoutesByType(type, startCoords, destinationCoords, apiKey, highwayNodes) {
    try {
        const origin = `${startCoords.x},${startCoords.y}`;
        const destination = `${destinationCoords.x},${destinationCoords.y}`;

        const waypoints = [];
        waypoints.push([startCoords.x, startCoords.y]);
        waypoints.push(highwayNodes);
        waypoints.push([destinationCoords.x, destinationCoords.y]);

        addMarkersAndSetCenter(startCoords, destinationCoords);
        //addMarkers(highwayNodes);

        drawRoutesWayPoint(waypoints, apiKey, true);

        //const time = calculateShortestTime(); // 최소 시간 계산 함수
        // const time = 130;
        // document.getElementById('time-info').innerText = time + ' 분';
        // if(type == 'time'){
        //     const distance = totalDistanceRoot1
        //     document.getElementById('distance-info').innerText = distance + ' km'; // 거리 정보 업데이트
        //
        // }
        // else if (type == 'distance'){
        //     const distance = totalDistanceRoot2
        //     document.getElementById('distance-info').innerText = distance + ' km'; // 거리 정보 업데이트
        //
        // }

        resetSearch();
    } catch (error) {
        console.error("Error:", error);
        alert('경로 표시 중 오류가 발생했습니다.');
    }
}