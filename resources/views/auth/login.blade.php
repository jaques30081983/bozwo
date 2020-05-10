@extends('layouts.app')

@section('header')
<script type="text/javascript">
		sap.ui.getCore().attachInit(function () {
			// create a mobile app and display page1 initially
			var app = new sap.m.App("myApp", {
				initialPage: "page1"
			});
			// create the first page
			var page1 = new sap.m.Page("page1", {
				title : "Login",
				showNavButton : false,
				
				headerContent : new sap.m.Image({
					src : "images/favicon.png",
					width : "48px"
				})
			});
			
			var form_html = new sap.ui.core.HTML({
				content : '<form id="myForm" class="form-horizontal" role="form" method="POST" action="{{ url('/login') }}">{{ csrf_field() }}<input type="hidden" id="email" name="email"><input type="hidden" id="password" name="password">'
			});
			
			var spacer = new sap.m.Label({
			});
			var layout_box = new sap.m.FlexBox({
			
				height : "300px",
				alignItems : "Center",
				justifyContent : "Center"	
			});
			
			var panel = new sap.m.Panel({
				width : "300px"
			});
			
			var logo = new sap.m.Image({
					src : "images/favicon.png"
					
			});
			
			var user_input_email = new sap.m.Input({
					id : "email",
					name : "email",
					value : "{{ old('email') }}",
					placeholder : "email..."
					
					});

			
			
			var user_input_password = new sap.m.Input({
					id : "password",
					name : "password",
					placeholder : "password...",
					type : "Password",
					submit : function() {
						// navigate to page2
						//app.to("page2");
						document.getElementById('email').value = document.getElementById('email-inner').value;
						document.getElementById('password').value = document.getElementById('password-inner').value;
						document.getElementById("myForm").submit();
					}
					
					});
			
			var user_submit = content = new sap.m.Button({
					text : "Login",
					width : "100%",
					press : function() {
						// navigate to page2
						//app.to("page2");
						document.getElementById('email').value = document.getElementById('email-inner').value;
						document.getElementById('password').value = document.getElementById('password-inner').value;
						document.getElementById("myForm").submit();
					}
				});
			var form_end_html = new sap.ui.core.HTML({
				content : "</form>"
			});
			

		panel.addContent(form_html).addContent(user_input_email).addContent(user_input_password).addContent(user_submit).addContent(form_end_html);
			layout_box.addItem(panel);
			
						
			@if ($errors->has('email'))
                       
				var message = new sap.m.MessageStrip({
					text : "{{ $errors->first('email') }}",
					type : "Error",
					showIcon : true,
					showCloseButton : true,
					class : "sapUiMediumMarginBottom"
					});
			panel.addContent(message)
			@endif
			
			
			@if ($errors->has('password'))                      
				var message2 = new sap.m.MessageStrip({
					text : "{{ $errors->first('password') }}",
					type : "Error",
					showIcon : true,
					showCloseButton : true,
					class : "sapUiMediumMarginBottom"
					});
			panel.addContent(message2)
            @endif
			
			

			
			page1.addContent(spacer).addContent(layout_box);
			

			
			
			// create the second page with a back button
			var page2 = new sap.m.Page("page2", {
				title : "Hello Page 2",
				showNavButton : true,
				navButtonPress : function () {
					// go back to the previous page
					app.back();
				}
			});
			// add both pages to the app
			app.addPage(page1).addPage(page2);
			// place the app into the HTML document
			app.placeAt("content");
		});
	</script>

@endsection

@section('content')
<!--	

	<l:VerticalLayout
		class="sapUiContentPadding"
		width="100%">
		<l:content>
			<Image src="images/favicon.png" width="32"/>
			 <form class="form-horizontal" role="form" method="POST" action="{{ url('/login') }}">
                        {{ csrf_field() }}
			<Label text="User" />
			<Input id="email" type="email" class="form-control" name="email" value="{{ old('email') }}" required autofocus/>
			
			<Label text="Password" />
			<Input id="password" type="password" class="form-control" name="password" required/>
				  <button type="submit" class="btn btn-primary">
                                    Login
                                </button>
			</form>
		</l:content>
	</l:VerticalLayout>




<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div class="panel panel-default">
                <div class="panel-heading">Login</div>
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url('/login') }}">
                        {{ csrf_field() }}

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <label for="email" class="col-md-4 control-label">E-Mail Address</label>

                            <div class="col-md-6">
                                <input id="email" type="email" class="form-control" name="email" value="{{ old('email') }}" required autofocus>

                                @if ($errors->has('email'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                            <label for="password" class="col-md-4 control-label">Password</label>

                            <div class="col-md-6">
                                <input id="password" type="password" class="form-control" name="password" required>

                                @if ($errors->has('password'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-6 col-md-offset-4">
                                <div class="checkbox">
                                    <label>
                                        <input type="checkbox" name="remember"> Remember Me
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-8 col-md-offset-4">
                                <button type="submit" class="btn btn-primary">
                                    Login
                                </button>

                                <a class="btn btn-link" href="{{ url('/password/reset') }}">
                                    Forgot Your Password?
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
-->

	
@endsection
