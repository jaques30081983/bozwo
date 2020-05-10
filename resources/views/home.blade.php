@extends('layouts.app')

@section('header')
<script>
		sap.ui.getCore().attachInit(function () {
			new sap.m.Shell({
				app: new sap.ui.core.ComponentContainer({
					name: "sap.ui.bw.bozwo"
				}),
				appWidthLimited: false
			}).placeAt("content");
			
			//var user_name = "{{ Auth::user()->name }}";
			
			// A module declaration, ensures that sap.ui.sample exists
			jQuery.sap.declare("sap.ui.bw.bozwo.User");

			// now it is safe to use that namespace object and assign a new member 'MyClass'
			// to it
			// Note that jQuery.sap.declare does not create the MyClass object.
			// So the developer can decide whether it should be a function, an object,
			// or an instance of a specific type
			
			//sap.ui.bw.bozwo.User = { key1 : 'value1' };

			// the following line guarantees that <code>sap.ui.sample.subspace</code>
			// is a valid object
			
			//TODO namspace is deprecated !
			sap.ui.namespace("sap.ui.bw.bozwo.User");

			// now one can use this namespace as well
			sap.ui.bw.bozwo.User.id = '{{ Auth::user()->id }}';
			sap.ui.bw.bozwo.User.people_id = '{{ Auth::user()->people_id }}';
			sap.ui.bw.bozwo.User.name = '{{ Auth::user()->name }}';
			sap.ui.bw.bozwo.User.token = 3.141; //TODO


			
		});
	</script>


<link rel="stylesheet" href="blockrain/blockrain.css">

<script src="blockrain/blockrain.jquery.min.js"></script>


@endsection


@section('content')

@if (Auth::guest())
	<li><a href="{{ url('/login') }}">Login</a></li>
	<li><a href="{{ url('/register') }}">Register</a></li>
@else
<form id="logout-form" action="{{ url('/logout') }}" method="POST" style="display: none;">
					{{ csrf_field() }}
</form>	

<form id="email-form"  action="https://kasmail.kasserver.com/index.php" method="post" name="login_form" target="_blank" style="display: none;">
<input type="hidden" name="open" value="start">
<input type="hidden" name="login_name" id="login_name" value="{{ Auth::user()->email }}">
<input type="hidden" name="login_password" value="{{ Auth::user()->email_password }}">
<input type="hidden" name="login_secure" value="ssl">

</form>


@endif


@endsection