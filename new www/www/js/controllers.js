
angular.module('app.controllers', [])

  
/*function getCont(contID){
 for (var i = 0; i < conts.length; i++) {
     if (conts[i].id===contID){
         return conts[i];
 }
 return undefined;
}
}*/

.controller('ListCtrl', function($scope){
  $scope.conts = [
    {
      id:'1',
      type: 'PHONE',
      company: 'EE',
      person: 'Roozbeh',
      ref: '121212'
    },
    {
      id: '2',  
      type: 'TRIAL',
      company: 'GUSTO',
      person: 'Maryam',
      ref: '131313'
    }
    
  ];
})
  
.controller('openCtrl', function($scope, $state) {
    $scope.contID = $state.params.contID
})

.controller('timelineCtrl', function($scope) {

})
      
.controller('linkedinCtrl', function($scope) {

})
   
.controller('tescoCtrl', function($scope) {

})
   
.controller('o2Ctrl', function($scope) {

})
   
.controller('lAFitnessCtrl', function($scope) {

})
   
.controller('addItemCtrl', function($scope) {

})
   
.controller('settingsCtrl', function($scope) {

})
