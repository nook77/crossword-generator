use utf8;
use strict;
use Storable;
use Data::Printer;
use JSON;
use List::Util qw(first);

my $in_filename = qq`clues2.txt`;
my $out_filename = qq`../www/data/answers_hash.json`;

my @LINE;
my $clue;
my $answer;
my %ANSWERS_HASH;

open(FILE, "<$in_filename") or die "Can't open clues.txt: $!\n";

my $count = 1;	
while (<FILE>) { 
	@LINE = split("%%%%%",$_);
	foreach my $line (@LINE) {
		($clue) = $line =~ m`^(.*?),,`;
		if ($clue =~ m`[a-z]`i) {
			($answer) = $line =~ m`,,(.*?)$`;
			$clue =~ s`""`'`g;
			$clue =~ s`^"``;
			$clue =~ s`"$``;
			push @{ $ANSWERS_HASH{$answer} }, $clue;
		}
	}
}
close (FILE);

#p %ANSWERS_HASH;
open(FILE, ">$out_filename") or die "Can't open $out_filename: $!\n";
print FILE JSON->new->pretty->encode(\%ANSWERS_HASH);
close(FILE);
print "answers_hash_creator = fin\n";