<?php

namespace App\Mail;

use App\Masterdata;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendDocument extends Mailable
{
    use Queueable, SerializesModels;

    public $data;

    /**
     * Create a new message instance.
     *
     * @return void
     */



    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $data = $this->data;
        $this->from($data['mailFrom'])
                    ->bcc($data['mailFrom'])
                    ->subject($data['mailSubject'])
                    ->view('emails.documents')
                    ->text('emails.documents_plain');
                    
                    foreach($data['mailAttachments'] as $attachment){
                        $attachment['url'] = preg_replace('/document\//', 'spool/' , $attachment['url']);
                        $sessionId = session()->getId();
                        $attachment['url'] = preg_replace('/attachments\//', 'storage/app/attachments/'.$sessionId.'/' , $attachment['url']);
                        $this->attach(base_path().'/'.$attachment['url']);
                    }
                    
        return $this;
                   
    }
}
